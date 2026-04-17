<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->authService->login(
            $request->input('email'),
            $request->input('password'),
        );

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('role.permissions'),
        ]);
    }

    public function setupTotp(Request $request): JsonResponse
    {
        $result = $this->authService->enableTotp($request->user());

        return response()->json($result);
    }

    public function verifyTotp(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:6']);

        $valid = $this->authService->verifyTotp(
            $request->user(),
            $request->input('code'),
        );

        if (!$valid) {
            return response()->json(['message' => 'Invalid TOTP code'], 422);
        }

        return response()->json(['message' => 'TOTP verified']);
    }
}
