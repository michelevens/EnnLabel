<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dataset;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(private ExportService $exportService) {}

    public function export(Request $request, string $datasetId): JsonResponse|StreamedResponse
    {
        $request->validate([
            'format' => 'nullable|string|in:json,csv',
            'status' => 'nullable|string',
        ]);

        $dataset = Dataset::findOrFail($datasetId);
        $format = $request->input('format', 'json');
        $data = $this->exportService->exportDataset($dataset, $format, $request->only('status'));

        if ($format === 'csv') {
            $csv = $this->exportService->toCsv($data);

            return response()->streamDownload(function () use ($csv) {
                echo $csv;
            }, "{$dataset->name}_export.csv", [
                'Content-Type' => 'text/csv',
            ]);
        }

        return response()->json([
            'dataset' => $dataset->name,
            'exported_at' => now()->toIso8601String(),
            'record_count' => count($data),
            'data' => $data,
        ]);
    }
}
