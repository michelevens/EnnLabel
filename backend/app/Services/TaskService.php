<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\DataRecord;
use App\Models\Dataset;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskService
{
    public function createTasksFromDataset(Dataset $dataset, string $taxonomyId, User $admin): int
    {
        $records = $dataset->records()->get();
        $count = 0;

        $chunks = $records->chunk(500);

        foreach ($chunks as $chunk) {
            $inserts = [];
            foreach ($chunk as $record) {
                $inserts[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'dataset_id' => $dataset->id,
                    'data_record_id' => $record->id,
                    'taxonomy_id' => $taxonomyId,
                    'status' => Task::STATUS_PENDING,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $count++;
            }
            Task::insert($inserts);
        }

        AuditLog::record('create', 'tasks', $dataset->id, null, [
            'count' => $count,
            'dataset' => $dataset->name,
        ]);

        return $count;
    }

    public function assignTask(Task $task, string $annotatorId, User $assigner): Task
    {
        $oldValues = $task->only(['assigned_to', 'status']);

        $task->update([
            'assigned_to' => $annotatorId,
            'assigned_by' => $assigner->id,
            'status' => Task::STATUS_PENDING,
        ]);

        AuditLog::record('update', 'task', $task->id, $oldValues, [
            'assigned_to' => $annotatorId,
        ]);

        return $task->fresh(['assignee', 'dataRecord', 'taxonomy.labels']);
    }

    public function bulkAssign(array $taskIds, string $annotatorId, User $assigner): int
    {
        return DB::transaction(function () use ($taskIds, $annotatorId, $assigner) {
            $updated = Task::whereIn('id', $taskIds)
                ->where('status', Task::STATUS_PENDING)
                ->update([
                    'assigned_to' => $annotatorId,
                    'assigned_by' => $assigner->id,
                ]);

            AuditLog::record('update', 'tasks', null, null, [
                'bulk_assign' => $updated,
                'annotator' => $annotatorId,
            ]);

            return $updated;
        });
    }

    public function updateStatus(Task $task, string $status, User $user): Task
    {
        $oldStatus = $task->status;

        $updates = ['status' => $status];

        if ($status === Task::STATUS_IN_PROGRESS && !$task->started_at) {
            $updates['started_at'] = now();
        }

        if ($status === Task::STATUS_COMPLETED) {
            $updates['completed_at'] = now();
        }

        $task->update($updates);

        AuditLog::record('update', 'task', $task->id, ['status' => $oldStatus], ['status' => $status]);

        return $task->fresh();
    }

    public function listTasks(array $filters = [], ?User $user = null)
    {
        $query = Task::with(['dataset:id,name', 'assignee:id,name', 'dataRecord', 'taxonomy:id,name']);

        if ($user && !$user->isAdmin()) {
            $query->where('assigned_to', $user->id);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['dataset_id'])) {
            $query->where('dataset_id', $filters['dataset_id']);
        }

        if (isset($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        return $query->orderBy('priority', 'desc')
            ->orderBy('created_at')
            ->paginate($filters['per_page'] ?? 20);
    }
}
