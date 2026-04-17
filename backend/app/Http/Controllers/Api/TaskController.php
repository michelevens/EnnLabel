<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private TaskService $taskService) {}

    public function index(Request $request): JsonResponse
    {
        $tasks = $this->taskService->listTasks(
            $request->only(['status', 'dataset_id', 'assigned_to', 'per_page']),
            $request->user(),
        );

        return response()->json($tasks);
    }

    public function show(string $id): JsonResponse
    {
        $task = Task::with([
            'dataset:id,name',
            'dataRecord',
            'taxonomy.labels',
            'assignee:id,name',
            'annotations' => fn($q) => $q->where('is_current', true)->with('label'),
            'reviews.reviewer:id,name',
        ])->findOrFail($id);

        return response()->json($task);
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'dataset_id' => 'required|uuid|exists:datasets,id',
            'taxonomy_id' => 'required|uuid|exists:taxonomies,id',
        ]);

        $dataset = \App\Models\Dataset::findOrFail($request->input('dataset_id'));

        $count = $this->taskService->createTasksFromDataset(
            $dataset,
            $request->input('taxonomy_id'),
            $request->user(),
        );

        return response()->json([
            'message' => "Created {$count} tasks",
            'count' => $count,
        ], 201);
    }

    public function assign(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required_without:task_ids|uuid|exists:tasks,id',
            'task_ids' => 'required_without:task_id|array',
            'task_ids.*' => 'uuid|exists:tasks,id',
            'annotator_id' => 'required|uuid|exists:users,id',
        ]);

        if ($request->has('task_ids')) {
            $count = $this->taskService->bulkAssign(
                $request->input('task_ids'),
                $request->input('annotator_id'),
                $request->user(),
            );
            return response()->json(['message' => "Assigned {$count} tasks"]);
        }

        $task = Task::findOrFail($request->input('task_id'));
        $task = $this->taskService->assignTask(
            $task,
            $request->input('annotator_id'),
            $request->user(),
        );

        return response()->json($task);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:' . implode(',', Task::STATUSES),
        ]);

        $task = Task::findOrFail($id);
        $task = $this->taskService->updateStatus(
            $task,
            $request->input('status'),
            $request->user(),
        );

        return response()->json($task);
    }
}
