<?php

namespace App\Services;

use App\Models\Annotation;
use App\Models\AuditLog;
use App\Models\QaScore;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class QaService
{
    /**
     * Calculate inter-annotator agreement between two annotators on the same task.
     * Uses span-level overlap with label matching (Cohen's Kappa approximation).
     */
    public function calculateAgreement(string $taskId, string $annotatorAId, string $annotatorBId): QaScore
    {
        $annotationsA = Annotation::where('task_id', $taskId)
            ->where('annotator_id', $annotatorAId)
            ->where('is_current', true)
            ->get();

        $annotationsB = Annotation::where('task_id', $taskId)
            ->where('annotator_id', $annotatorBId)
            ->where('is_current', true)
            ->get();

        $matches = 0;
        $conflicts = [];
        $totalSpans = max($annotationsA->count() + $annotationsB->count(), 1);

        foreach ($annotationsA as $annA) {
            $matched = false;
            foreach ($annotationsB as $annB) {
                $overlap = $this->calculateSpanOverlap(
                    $annA->start_offset, $annA->end_offset,
                    $annB->start_offset, $annB->end_offset
                );

                if ($overlap > 0.5) {
                    if ($annA->label_id === $annB->label_id) {
                        $matches += 2; // Both annotators agree
                        $matched = true;
                    } else {
                        $conflicts[] = [
                            'type' => 'label_mismatch',
                            'span' => "{$annA->start_offset}-{$annA->end_offset}",
                            'text' => $annA->selected_text,
                            'annotator_a_label' => $annA->label_id,
                            'annotator_b_label' => $annB->label_id,
                        ];
                        $matched = true;
                    }
                    break;
                }
            }

            if (!$matched) {
                $conflicts[] = [
                    'type' => 'missing_span',
                    'annotator' => 'b',
                    'span' => "{$annA->start_offset}-{$annA->end_offset}",
                    'text' => $annA->selected_text,
                ];
            }
        }

        // Check for spans in B that don't appear in A
        foreach ($annotationsB as $annB) {
            $found = false;
            foreach ($annotationsA as $annA) {
                $overlap = $this->calculateSpanOverlap(
                    $annA->start_offset, $annA->end_offset,
                    $annB->start_offset, $annB->end_offset
                );
                if ($overlap > 0.5) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $conflicts[] = [
                    'type' => 'missing_span',
                    'annotator' => 'a',
                    'span' => "{$annB->start_offset}-{$annB->end_offset}",
                    'text' => $annB->selected_text,
                ];
            }
        }

        $agreementScore = $totalSpans > 0 ? round($matches / $totalSpans, 4) : 0;
        $flagged = $agreementScore < 0.7 || count($conflicts) > 0;

        $qaScore = QaScore::create([
            'task_id' => $taskId,
            'annotator_a' => $annotatorAId,
            'annotator_b' => $annotatorBId,
            'agreement_score' => $agreementScore,
            'conflict_details' => $conflicts,
            'flagged' => $flagged,
        ]);

        AuditLog::record('create', 'qa_score', $qaScore->id, null, [
            'agreement' => $agreementScore,
            'flagged' => $flagged,
            'conflicts' => count($conflicts),
        ]);

        return $qaScore;
    }

    /**
     * Compute overlap ratio between two spans (Jaccard-style).
     */
    private function calculateSpanOverlap(int $startA, int $endA, int $startB, int $endB): float
    {
        $intersectionStart = max($startA, $startB);
        $intersectionEnd = min($endA, $endB);
        $intersection = max(0, $intersectionEnd - $intersectionStart);

        $union = ($endA - $startA) + ($endB - $startB) - $intersection;

        return $union > 0 ? $intersection / $union : 0;
    }

    /**
     * Batch calculate agreement for a dataset where multiple annotators worked on the same tasks.
     */
    public function calculateDatasetAgreement(string $datasetId): array
    {
        // Find tasks with multiple annotators
        $tasks = Task::where('dataset_id', $datasetId)
            ->whereHas('annotations', function ($q) {
                $q->where('is_current', true);
            })
            ->get();

        $results = [];

        foreach ($tasks as $task) {
            $annotatorIds = Annotation::where('task_id', $task->id)
                ->where('is_current', true)
                ->distinct()
                ->pluck('annotator_id')
                ->toArray();

            if (count($annotatorIds) < 2) continue;

            // Compare all pairs
            for ($i = 0; $i < count($annotatorIds); $i++) {
                for ($j = $i + 1; $j < count($annotatorIds); $j++) {
                    $results[] = $this->calculateAgreement(
                        $task->id,
                        $annotatorIds[$i],
                        $annotatorIds[$j]
                    );
                }
            }
        }

        return $results;
    }

    /**
     * Get flagged QA scores requiring resolution.
     */
    public function getFlaggedScores(array $filters = [])
    {
        $query = QaScore::where('flagged', true)
            ->whereNull('resolved_by')
            ->with(['task.dataset:id,name', 'annotatorA:id,name', 'annotatorB:id,name']);

        if (isset($filters['dataset_id'])) {
            $query->whereHas('task', fn($q) => $q->where('dataset_id', $filters['dataset_id']));
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Resolve a flagged QA score.
     */
    public function resolve(QaScore $qaScore, User $resolver): QaScore
    {
        $qaScore->update([
            'resolved_by' => $resolver->id,
            'resolved_at' => now(),
        ]);

        AuditLog::record('update', 'qa_score', $qaScore->id, null, [
            'resolved_by' => $resolver->id,
        ]);

        return $qaScore->fresh();
    }

    /**
     * Get dataset-level QA summary stats.
     */
    public function getDatasetQaStats(string $datasetId): array
    {
        $scores = QaScore::whereHas('task', fn($q) => $q->where('dataset_id', $datasetId))->get();

        if ($scores->isEmpty()) {
            return [
                'total_comparisons' => 0,
                'average_agreement' => null,
                'flagged_count' => 0,
                'resolved_count' => 0,
                'unresolved_count' => 0,
            ];
        }

        return [
            'total_comparisons' => $scores->count(),
            'average_agreement' => round($scores->avg('agreement_score'), 4),
            'flagged_count' => $scores->where('flagged', true)->count(),
            'resolved_count' => $scores->whereNotNull('resolved_by')->count(),
            'unresolved_count' => $scores->where('flagged', true)->whereNull('resolved_by')->count(),
            'min_agreement' => round($scores->min('agreement_score'), 4),
            'max_agreement' => round($scores->max('agreement_score'), 4),
        ];
    }
}
