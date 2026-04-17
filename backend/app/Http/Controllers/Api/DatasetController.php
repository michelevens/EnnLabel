<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dataset;
use App\Services\DatasetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DatasetController extends Controller
{
    public function __construct(private DatasetService $datasetService) {}

    public function index(Request $request): JsonResponse
    {
        $datasets = $this->datasetService->list($request->only([
            'status', 'schema_type', 'search', 'per_page',
        ]));

        return response()->json($datasets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'source' => 'nullable|string|max:255',
            'schema_type' => 'nullable|string|in:text,ner,classification',
            'file' => 'required|file|mimes:csv,json,txt|max:102400', // 100MB
        ]);

        $dataset = $this->datasetService->create(
            $request->only(['name', 'description', 'source', 'schema_type', 'metadata']),
            $request->file('file'),
            $request->user(),
        );

        return response()->json($dataset, 201);
    }

    public function show(string $id): JsonResponse
    {
        $dataset = Dataset::with(['creator:id,name', 'versions', 'tasks' => function ($q) {
            $q->selectRaw('dataset_id, status, count(*) as count')
                ->groupBy('dataset_id', 'status');
        }])->findOrFail($id);

        return response()->json($dataset);
    }

    public function uploadVersion(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,json,txt|max:102400',
            'change_notes' => 'nullable|string',
        ]);

        $dataset = Dataset::findOrFail($id);

        $version = $this->datasetService->uploadNewVersion(
            $dataset,
            $request->file('file'),
            $request->user(),
            $request->input('change_notes'),
        );

        return response()->json($version, 201);
    }
}
