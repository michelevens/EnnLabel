<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taxonomies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // e.g., "DSM-5", "ICD-10", "Custom Labels"
            $table->text('description')->nullable();
            $table->string('type')->default('custom'); // dsm5, icd10, custom
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users');
        });

        Schema::create('labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('taxonomy_id');
            $table->string('name');
            $table->string('code')->nullable(); // e.g., "F32.1" for ICD-10
            $table->string('color', 7)->default('#3B82F6');
            $table->text('description')->nullable();
            $table->string('shortcut_key', 5)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('taxonomy_id')->references('id')->on('taxonomies')->cascadeOnDelete();
            $table->index('taxonomy_id');
            $table->unique(['taxonomy_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labels');
        Schema::dropIfExists('taxonomies');
    }
};
