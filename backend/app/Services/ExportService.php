<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Dataset;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class ExportService
{
    public function exportDataset(Dataset $dataset, string $format = 'json', array $filters = []): array
    {
        $query = Task::where('dataset_id', $dataset->id)
            ->with([
                'dataRecord',
                'annotations' => fn($q) => $q->where('is_current', true)->with('label'),
                'reviews' => fn($q) => $q->latest()->limit(1),
                'assignee:id,name',
            ]);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $tasks = $query->get();

        $exportData = $tasks->map(function (Task $task) {
            return [
                'record_id' => $task->data_record_id,
                'text' => $task->dataRecord->content,
                'metadata' => $task->dataRecord->metadata,
                'annotations' => $task->annotations->map(fn($a) => [
                    'label' => $a->label->name,
                    'label_code' => $a->label->code,
                    'start' => $a->start_offset,
                    'end' => $a->end_offset,
                    'text' => $a->selected_text,
                    'annotator' => $a->annotator_id,
                    'created_at' => $a->created_at->toIso8601String(),
                ]),
                'task_status' => $task->status,
                'review_status' => $task->reviews->first()?->decision,
                'review_comments' => $task->reviews->first()?->comments,
            ];
        })->toArray();

        AuditLog::record('export', 'dataset', $dataset->id, null, [
            'format' => $format,
            'record_count' => count($exportData),
        ]);

        return $exportData;
    }

    public function toCsv(array $data): string
    {
        if (empty($data)) {
            return '';
        }

        $output = fopen('php://temp', 'r+');

        // Flatten for CSV
        $headers = ['record_id', 'text', 'task_status', 'review_status', 'review_comments', 'annotations_json'];
        fputcsv($output, $headers);

        foreach ($data as $row) {
            fputcsv($output, [
                $row['record_id'],
                $row['text'],
                $row['task_status'],
                $row['review_status'] ?? '',
                $row['review_comments'] ?? '',
                json_encode($row['annotations']),
            ]);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
