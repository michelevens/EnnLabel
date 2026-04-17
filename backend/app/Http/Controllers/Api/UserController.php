<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role:id,name,display_name')
            ->withCount(['tasks', 'annotations']);

        if ($request->has('role')) {
            $query->whereHas('role', fn($q) => $q->where('name', $request->input('role')));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')
            ->paginate($request->input('per_page', 20));

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
            'role_id' => 'required|uuid|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role_id' => $request->input('role_id'),
            'email_verified_at' => now(),
        ]);

        AuditLog::record('create', 'user', $user->id, null, [
            'name' => $user->name,
            'email' => $user->email,
        ]);

        return response()->json($user->load('role'), 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with(['role.permissions'])
            ->withCount(['tasks', 'annotations', 'reviews'])
            ->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$id}",
            'password' => ['sometimes', Password::min(8)->mixedCase()->numbers()],
            'role_id' => 'sometimes|uuid|exists:roles,id',
            'is_active' => 'sometimes|boolean',
        ]);

        $oldValues = $user->only(['name', 'email', 'role_id', 'is_active']);

        $data = $request->only(['name', 'email', 'role_id', 'is_active']);
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->input('password'));
        }

        $user->update($data);

        AuditLog::record('update', 'user', $user->id, $oldValues, $data);

        return response()->json($user->fresh('role'));
    }

    public function destroy(string $id, Request $request): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        AuditLog::record('delete', 'user', $user->id, $user->toArray());

        $user->update(['is_active' => false]); // Soft-deactivate, don't hard delete

        return response()->json(['message' => 'User deactivated']);
    }

    /**
     * Get annotators for task assignment dropdown.
     */
    public function annotators(): JsonResponse
    {
        $annotators = User::where('is_active', true)
            ->whereHas('role', fn($q) => $q->where('name', Role::ANNOTATOR))
            ->select('id', 'name', 'email')
            ->withCount('tasks')
            ->orderBy('name')
            ->get();

        return response()->json($annotators);
    }

    /**
     * Get roles list.
     */
    public function roles(): JsonResponse
    {
        $roles = Role::withCount('users')->get();

        return response()->json($roles);
    }
}
