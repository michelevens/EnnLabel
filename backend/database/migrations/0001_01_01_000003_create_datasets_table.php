<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('datasets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('source')->nullable();
            $table->string('schema_type')->default('text'); // text, ner, classification
            $table->uuid('created_by');
            $table->integer('record_count')->default(0);
            $table->string('status')->default('active'); // active, archived
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users');
            $table->index('status');
            $table->index('schema_type');
        });

        Schema::create('dataset_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('dataset_id');
            $table->integer('version_number');
            $table->string('file_path');
            $table->string('file_type'); // csv, json
            $table->bigInteger('file_size');
            $table->string('checksum');
            $table->uuid('uploaded_by');
            $table->text('change_notes')->nullable();
            $table->timestamps();

            $table->foreign('dataset_id')->references('id')->on('datasets')->cascadeOnDelete();
            $table->foreign('uploaded_by')->references('id')->on('users');
            $table->unique(['dataset_id', 'version_number']);
            $table->index('dataset_id');
        });

        Schema::create('data_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('dataset_id');
            $table->uuid('dataset_version_id');
            $table->text('content'); // the actual text to annotate
            $table->jsonb('metadata')->nullable();
            $table->integer('sequence_index');
            $table->timestamps();

            $table->foreign('dataset_id')->references('id')->on('datasets')->cascadeOnDelete();
            $table->foreign('dataset_version_id')->references('id')->on('dataset_versions')->cascadeOnDelete();
            $table->index('dataset_id');
            $table->index('dataset_version_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_records');
        Schema::dropIfExists('dataset_versions');
        Schema::dropIfExists('datasets');
    }
};
