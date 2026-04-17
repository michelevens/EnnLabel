<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Annotation;
use App\Models\Task;
use App\Services\AnnotationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnotationController extends Controller
{
    public function __construct(private AnnotationService $annotationService) {}

    public function index(string $taskId): JsonResponse
    {
        $annotations = $this->annotationService->getByTask($taskId);

        return response()->json($annotations);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|uuid|exists:tasks,id',
            'label_id' => 'required|uuid|exists:labels,id',
            'start_offset' => 'required|integer|min:0',
            'end_offset' => 'required|integer|gt:start_offset',
            'selected_text' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        $task = Task::findOrFail($request->input('task_id'));

        $annotation = $this->annotationService->create(
            $task,
            $request->only(['label_id', 'start_offset', 'end_offset', 'selected_text', 'metadata']),
            $request->user(),
        );

        return response()->json($annotation, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'label_id' => 'nullable|uuid|exists:labels,id',
            'start_offset' => 'nullable|integer|min:0',
            'end_offset' => 'nullable|integer',
            'selected_text' => 'nullable|string',
            'change_reason' => 'nullable|string',
        ]);

        $annotation = Annotation::findOrFail($id);

        $annotation = $this->annotationService->update(
            $annotation,
            $request->only(['label_id', 'start_offset', 'end_offset', 'selected_text', 'change_reason']),
            $request->user(),
        );

        return response()->json($annotation);
    }

    public function destroy(string $id): JsonResponse
    {
        $annotation = Annotation::findOrFail($id);
        $this->annotationService->delete($annotation, request()->user());

        return response()->json(['message' => 'Annotation deleted']);
    }
}
