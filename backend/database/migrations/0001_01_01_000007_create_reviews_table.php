<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id');
            $table->uuid('reviewer_id');
            $table->string('decision'); // approved, rejected, needs_revision
            $table->text('comments')->nullable();
            $table->jsonb('annotation_edits')->nullable(); // if reviewer modified annotations
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('tasks');
            $table->foreign('reviewer_id')->references('id')->on('users');

            $table->index('task_id');
            $table->index('reviewer_id');
            $table->index('decision');
        });

        // QA agreement tracking
        Schema::create('qa_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id');
            $table->uuid('annotator_a');
            $table->uuid('annotator_b');
            $table->float('agreement_score');
            $table->jsonb('conflict_details')->nullable();
            $table->boolean('flagged')->default(false);
            $table->uuid('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('tasks');
            $table->foreign('annotator_a')->references('id')->on('users');
            $table->foreign('annotator_b')->references('id')->on('users');
            $table->foreign('resolved_by')->references('id')->on('users');

            $table->index('task_id');
            $table->index('flagged');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qa_scores');
        Schema::dropIfExists('reviews');
    }
};
