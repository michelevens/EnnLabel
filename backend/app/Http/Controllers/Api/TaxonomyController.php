<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Label;
use App\Models\Taxonomy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxonomyController extends Controller
{
    public function index(): JsonResponse
    {
        $taxonomies = Taxonomy::with('labels')
            ->withCount('labels')
            ->orderBy('name')
            ->get();

        return response()->json($taxonomies);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|in:dsm5,icd10,custom',
            'labels' => 'required|array|min:1',
            'labels.*.name' => 'required|string|max:255',
            'labels.*.code' => 'nullable|string|max:50',
            'labels.*.color' => 'nullable|string|max:7',
            'labels.*.description' => 'nullable|string',
            'labels.*.shortcut_key' => 'nullable|string|max:5',
        ]);

        $taxonomy = Taxonomy::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'type' => $request->input('type', 'custom'),
            'created_by' => $request->user()->id,
        ]);

        foreach ($request->input('labels') as $index => $labelData) {
            $taxonomy->labels()->create([
                ...$labelData,
                'sort_order' => $index,
            ]);
        }

        AuditLog::record('create', 'taxonomy', $taxonomy->id);

        return response()->json($taxonomy->load('labels'), 201);
    }

    public function show(string $id): JsonResponse
    {
        $taxonomy = Taxonomy::with('labels')->findOrFail($id);

        return response()->json($taxonomy);
    }
}
