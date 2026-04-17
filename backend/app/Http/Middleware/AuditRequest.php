<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && !$request->is('api/audit-logs*')) {
            $method = $request->method();
            $action = match ($method) {
                'GET' => 'access',
                'POST' => 'create',
                'PUT', 'PATCH' => 'update',
                'DELETE' => 'delete',
                default => 'access',
            };

            AuditLog::record(
                action: $action,
                resourceType: $this->extractResourceType($request),
                resourceId: $request->route()?->parameter('id'),
            );
        }

        return $response;
    }

    private function extractResourceType(Request $request): string
    {
        $path = trim($request->path(), '/');
        $segments = explode('/', $path);

        // api/datasets/xxx -> datasets
        return $segments[1] ?? $segments[0] ?? 'unknown';
    }
}
