<?php

namespace App\Services;

use App\Models\Annotation;
use App\Models\AnnotationVersion;
use App\Models\AuditLog;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AnnotationService
{
    public function create(Task $task, array $data, User $annotator): Annotation
    {
        return DB::transaction(function () use ($task, $data, $annotator) {
            if ($task->status === Task::STATUS_PENDING) {
                $task->update([
                    'status' => Task::STATUS_IN_PROGRESS,
                    'started_at' => now(),
                ]);
            }

            $annotation = Annotation::create([
                'task_id' => $task->id,
                'data_record_id' => $task->data_record_id,
                'label_id' => $data['label_id'],
                'annotator_id' => $annotator->id,
                'start_offset' => $data['start_offset'],
                'end_offset' => $data['end_offset'],
                'selected_text' => $data['selected_text'],
                'metadata' => $data['metadata'] ?? null,
            ]);

            AnnotationVersion::create([
                'annotation_id' => $annotation->id,
                'version_number' => 1,
                'label_id' => $annotation->label_id,
                'start_offset' => $annotation->start_offset,
                'end_offset' => $annotation->end_offset,
                'selected_text' => $annotation->selected_text,
                'changed_by' => $annotator->id,
                'change_reason' => 'Initial annotation',
            ]);

            AuditLog::record('create', 'annotation', $annotation->id, null, [
                'task_id' => $task->id,
                'label_id' => $data['label_id'],
                'span' => "{$data['start_offset']}-{$data['end_offset']}",
            ]);

            return $annotation->load(['label', 'annotator:id,name']);
        });
    }

    public function update(Annotation $annotation, array $data, User $user): Annotation
    {
        return DB::transaction(function () use ($annotation, $data, $user) {
            $oldState = $annotation->only([
                'label_id', 'start_offset', 'end_offset', 'selected_text',
            ]);

            $latestVersion = $annotation->versions()->max('version_number') ?? 0;

            AnnotationVersion::create([
                'annotation_id' => $annotation->id,
                'version_number' => $latestVersion + 1,
                'label_id' => $data['label_id'] ?? $annotation->label_id,
                'start_offset' => $data['start_offset'] ?? $annotation->start_offset,
                'end_offset' => $data['end_offset'] ?? $annotation->end_offset,
                'selected_text' => $data['selected_text'] ?? $annotation->selected_text,
                'changed_by' => $user->id,
                'change_reason' => $data['change_reason'] ?? null,
                'previous_state' => $oldState,
            ]);

            $annotation->update(array_filter([
                'label_id' => $data['label_id'] ?? null,
                'start_offset' => $data['start_offset'] ?? null,
                'end_offset' => $data['end_offset'] ?? null,
                'selected_text' => $data['selected_text'] ?? null,
            ]));

            AuditLog::record('update', 'annotation', $annotation->id, $oldState, $data);

            return $annotation->fresh(['label', 'annotator:id,name', 'versions']);
        });
    }

    public function delete(Annotation $annotation, User $user): void
    {
        AuditLog::record('delete', 'annotation', $annotation->id, $annotation->toArray());
        $annotation->delete();
    }

    public function getByTask(string $taskId)
    {
        return Annotation::where('task_id', $taskId)
            ->where('is_current', true)
            ->with(['label', 'annotator:id,name'])
            ->orderBy('start_offset')
            ->get();
    }
}
