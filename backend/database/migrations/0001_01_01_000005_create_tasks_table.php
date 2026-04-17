<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('dataset_id');
            $table->uuid('data_record_id');
            $table->uuid('taxonomy_id');
            $table->uuid('assigned_to')->nullable();
            $table->uuid('assigned_by')->nullable();
            $table->string('status')->default('pending');
            // pending, in_progress, completed, under_review, approved, rejected
            $table->integer('priority')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('dataset_id')->references('id')->on('datasets');
            $table->foreign('data_record_id')->references('id')->on('data_records');
            $table->foreign('taxonomy_id')->references('id')->on('taxonomies');
            $table->foreign('assigned_to')->references('id')->on('users');
            $table->foreign('assigned_by')->references('id')->on('users');

            $table->index('status');
            $table->index('assigned_to');
            $table->index('dataset_id');
            $table->index(['status', 'assigned_to']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
