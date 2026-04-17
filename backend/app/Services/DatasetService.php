<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\DataRecord;
use App\Models\Dataset;
use App\Models\DatasetVersion;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DatasetService
{
    public function create(array $data, UploadedFile $file, User $user): Dataset
    {
        return DB::transaction(function () use ($data, $file, $user) {
            $dataset = Dataset::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'source' => $data['source'] ?? null,
                'schema_type' => $data['schema_type'] ?? 'text',
                'created_by' => $user->id,
                'metadata' => $data['metadata'] ?? null,
            ]);

            $version = $this->storeVersion($dataset, $file, $user);
            $recordCount = $this->parseAndStoreRecords($dataset, $version, $file);

            $dataset->update(['record_count' => $recordCount]);

            AuditLog::record('create', 'dataset', $dataset->id, null, [
                'name' => $dataset->name,
                'record_count' => $recordCount,
            ]);

            return $dataset->load(['versions', 'creator']);
        });
    }

    public function uploadNewVersion(Dataset $dataset, UploadedFile $file, User $user, ?string $notes = null): DatasetVersion
    {
        return DB::transaction(function () use ($dataset, $file, $user, $notes) {
            $version = $this->storeVersion($dataset, $file, $user, $notes);
            $recordCount = $this->parseAndStoreRecords($dataset, $version, $file);

            $dataset->update(['record_count' => $recordCount]);

            AuditLog::record('update', 'dataset', $dataset->id, null, [
                'version' => $version->version_number,
                'record_count' => $recordCount,
            ]);

            return $version;
        });
    }

    private function storeVersion(Dataset $dataset, UploadedFile $file, User $user, ?string $notes = null): DatasetVersion
    {
        $latestVersion = $dataset->versions()->max('version_number') ?? 0;
        $path = $file->store("datasets/{$dataset->id}", 's3');

        return DatasetVersion::create([
            'dataset_id' => $dataset->id,
            'version_number' => $latestVersion + 1,
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'checksum' => hash_file('sha256', $file->getRealPath()),
            'uploaded_by' => $user->id,
            'change_notes' => $notes,
        ]);
    }

    private function parseAndStoreRecords(Dataset $dataset, DatasetVersion $version, UploadedFile $file): int
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $content = file_get_contents($file->getRealPath());

        $records = match ($extension) {
            'json' => $this->parseJson($content),
            'csv' => $this->parseCsv($file->getRealPath()),
            default => throw new \InvalidArgumentException("Unsupported file type: {$extension}"),
        };

        $chunks = array_chunk($records, 500);
        $index = 0;

        foreach ($chunks as $chunk) {
            $inserts = [];
            foreach ($chunk as $record) {
                $inserts[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'dataset_id' => $dataset->id,
                    'dataset_version_id' => $version->id,
                    'content' => is_array($record) ? ($record['text'] ?? $record['content'] ?? json_encode($record)) : $record,
                    'metadata' => is_array($record) ? json_encode(array_diff_key($record, array_flip(['text', 'content']))) : null,
                    'sequence_index' => $index++,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DataRecord::insert($inserts);
        }

        return $index;
    }

    private function parseJson(string $content): array
    {
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON file');
        }

        return isset($data[0]) ? $data : [$data];
    }

    private function parseCsv(string $path): array
    {
        $records = [];
        $handle = fopen($path, 'r');
        $headers = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            $records[] = array_combine($headers, $row);
        }

        fclose($handle);
        return $records;
    }

    public function list(array $filters = [])
    {
        $query = Dataset::with(['creator:id,name', 'versions'])
            ->withCount('tasks');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['schema_type'])) {
            $query->where('schema_type', $filters['schema_type']);
        }

        if (isset($filters['search'])) {
            $query->where('name', 'ilike', "%{$filters['search']}%");
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 20);
    }
}
