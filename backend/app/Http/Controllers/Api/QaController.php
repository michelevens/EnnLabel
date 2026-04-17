<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QaScore;
use App\Services\QaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QaController extends Controller
{
    public function __construct(private QaService $qaService) {}

    /**
     * Calculate agreement between two annotators on a specific task.
     */
    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|uuid|exists:tasks,id',
            'annotator_a' => 'required|uuid|exists:users,id',
            'annotator_b' => 'required|uuid|exists:users,id|different:annotator_a',
        ]);

        $score = $this->qaService->calculateAgreement(
            $request->input('task_id'),
            $request->input('annotator_a'),
            $request->input('annotator_b'),
        );

        return response()->json($score, 201);
    }

    /**
     * Batch calculate agreement for entire dataset.
     */
    public function calculateDataset(Request $request): JsonResponse
    {
        $request->validate([
            'dataset_id' => 'required|uuid|exists:datasets,id',
        ]);

        $results = $this->qaService->calculateDatasetAgreement(
            $request->input('dataset_id')
        );

        return response()->json([
            'message' => sprintf('Calculated %d agreement scores', count($results)),
            'scores' => $results,
        ]);
    }

    /**
     * Get flagged QA scores that need resolution.
     */
    public function flagged(Request $request): JsonResponse
    {
        $scores = $this->qaService->getFlaggedScores(
            $request->only(['dataset_id', 'per_page'])
        );

        return response()->json($scores);
    }

    /**
     * Resolve a flagged QA conflict.
     */
    public function resolve(string $id, Request $request): JsonResponse
    {
        $qaScore = QaScore::findOrFail($id);

        $resolved = $this->qaService->resolve($qaScore, $request->user());

        return response()->json($resolved);
    }

    /**
     * Get QA stats for a dataset.
     */
    public function datasetStats(string $datasetId): JsonResponse
    {
        $stats = $this->qaService->getDatasetQaStats($datasetId);

        return response()->json($stats);
    }
}
