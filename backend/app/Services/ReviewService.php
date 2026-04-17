<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Review;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function create(Task $task, array $data, User $reviewer): Review
    {
        return DB::transaction(function () use ($task, $data, $reviewer) {
            $review = Review::create([
                'task_id' => $task->id,
                'reviewer_id' => $reviewer->id,
                'decision' => $data['decision'],
                'comments' => $data['comments'] ?? null,
                'annotation_edits' => $data['annotation_edits'] ?? null,
            ]);

            $newStatus = match ($data['decision']) {
                Review::APPROVED => Task::STATUS_APPROVED,
                Review::REJECTED => Task::STATUS_REJECTED,
                Review::NEEDS_REVISION => Task::STATUS_IN_PROGRESS,
            };

            $task->update(['status' => $newStatus]);

            AuditLog::record('create', 'review', $review->id, null, [
                'task_id' => $task->id,
                'decision' => $data['decision'],
            ]);

            return $review->load(['reviewer:id,name', 'task']);
        });
    }

    public function getByTask(string $taskId)
    {
        return Review::where('task_id', $taskId)
            ->with(['reviewer:id,name'])
            ->orderByDesc('created_at')
            ->get();
    }
}
