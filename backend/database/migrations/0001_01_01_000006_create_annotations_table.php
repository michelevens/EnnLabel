<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annotations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id');
            $table->uuid('data_record_id');
            $table->uuid('label_id');
            $table->uuid('annotator_id');
            $table->integer('start_offset');
            $table->integer('end_offset');
            $table->text('selected_text');
            $table->jsonb('metadata')->nullable();
            $table->boolean('is_current')->default(true);
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            $table->foreign('data_record_id')->references('id')->on('data_records');
            $table->foreign('label_id')->references('id')->on('labels');
            $table->foreign('annotator_id')->references('id')->on('users');

            $table->index('task_id');
            $table->index('data_record_id');
            $table->index('annotator_id');
            $table->index('is_current');
        });

        Schema::create('annotation_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('annotation_id');
            $table->integer('version_number');
            $table->uuid('label_id');
            $table->integer('start_offset');
            $table->integer('end_offset');
            $table->text('selected_text');
            $table->uuid('changed_by');
            $table->string('change_reason')->nullable();
            $table->jsonb('previous_state')->nullable();
            $table->timestamps();

            $table->foreign('annotation_id')->references('id')->on('annotations')->cascadeOnDelete();
            $table->foreign('label_id')->references('id')->on('labels');
            $table->foreign('changed_by')->references('id')->on('users');

            $table->index('annotation_id');
            $table->unique(['annotation_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annotation_versions');
        Schema::dropIfExists('annotations');
    }
};
