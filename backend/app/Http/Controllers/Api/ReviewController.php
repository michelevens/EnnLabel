<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Task;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function index(string $taskId): JsonResponse
    {
        $reviews = $this->reviewService->getByTask($taskId);

        return response()->json($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|uuid|exists:tasks,id',
            'decision' => 'required|string|in:approved,rejected,needs_revision',
            'comments' => 'nullable|string',
            'annotation_edits' => 'nullable|array',
        ]);

        $task = Task::findOrFail($request->input('task_id'));

        $review = $this->reviewService->create(
            $task,
            $request->only(['decision', 'comments', 'annotation_edits']),
            $request->user(),
        );

        return response()->json($review, 201);
    }
}
