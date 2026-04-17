<?php

use App\Http\Controllers\Api\AnnotationController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DatasetController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\QaController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaxonomyController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\AuditRequest;
use App\Http\Middleware\CheckRole;
use App\Models\Role;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware(['auth:sanctum', AuditRequest::class])->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/totp/setup', [AuthController::class, 'setupTotp']);
    Route::post('/totp/verify', [AuthController::class, 'verifyTotp']);

    // Datasets (Admin only for create)
    Route::get('/datasets', [DatasetController::class, 'index']);
    Route::get('/datasets/{id}', [DatasetController::class, 'show']);
    Route::middleware(CheckRole::class . ':' . Role::ADMIN)->group(function () {
        Route::post('/datasets', [DatasetController::class, 'store']);
        Route::post('/datasets/{id}/versions', [DatasetController::class, 'uploadVersion']);
    });

    // Taxonomies
    Route::get('/taxonomies', [TaxonomyController::class, 'index']);
    Route::get('/taxonomies/{id}', [TaxonomyController::class, 'show']);
    Route::middleware(CheckRole::class . ':' . Role::ADMIN)->group(function () {
        Route::post('/taxonomies', [TaxonomyController::class, 'store']);
    });

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::patch('/tasks/{id}', [TaskController::class, 'updateStatus']);
    Route::middleware(CheckRole::class . ':' . Role::ADMIN)->group(function () {
        Route::post('/tasks/generate', [TaskController::class, 'generate']);
        Route::post('/tasks/assign', [TaskController::class, 'assign']);
    });

    // Annotations
    Route::get('/annotations/{taskId}', [AnnotationController::class, 'index']);
    Route::middleware(CheckRole::class . ':' . Role::ADMIN . ',' . Role::ANNOTATOR . ',' . Role::CLINICIAN_REVIEWER)->group(function () {
        Route::post('/annotations', [AnnotationController::class, 'store']);
        Route::put('/annotations/{id}', [AnnotationController::class, 'update']);
        Route::delete('/annotations/{id}', [AnnotationController::class, 'destroy']);
    });

    // Reviews
    Route::get('/reviews/{taskId}', [ReviewController::class, 'index']);
    Route::middleware(CheckRole::class . ':' . Role::CLINICIAN_REVIEWER . ',' . Role::QA_REVIEWER . ',' . Role::ADMIN)->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store']);
    });

    // QA System
    Route::middleware(CheckRole::class . ':' . Role::QA_REVIEWER . ',' . Role::ADMIN)->group(function () {
        Route::post('/qa/calculate', [QaController::class, 'calculate']);
        Route::post('/qa/calculate-dataset', [QaController::class, 'calculateDataset']);
        Route::get('/qa/flagged', [QaController::class, 'flagged']);
        Route::patch('/qa/{id}/resolve', [QaController::class, 'resolve']);
        Route::get('/qa/stats/{datasetId}', [QaController::class, 'datasetStats']);
    });

    // Export
    Route::middleware(CheckRole::class . ':' . Role::ADMIN)->group(function () {
        Route::get('/export/{datasetId}', [ExportController::class, 'export']);
    });

    // User Management (Admin only)
    Route::middleware(CheckRole::class . ':' . Role::ADMIN)->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/annotators', [UserController::class, 'annotators']);
        Route::get('/users/roles', [UserController::class, 'roles']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // Audit Logs (Admin only)
    Route::middleware(CheckRole::class . ':' . Role::ADMIN)->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
