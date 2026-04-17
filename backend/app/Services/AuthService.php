<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth-token', ['*'], now()->addHours(8));

        AuditLog::record('login', 'user', $user->id);

        return [
            'user' => $user->load('role'),
            'token' => $token->plainTextToken,
            'requires_totp' => $user->totp_enabled,
        ];
    }

    public function logout(User $user): void
    {
        AuditLog::record('logout', 'user', $user->id);
        $user->currentAccessToken()->delete();
    }

    public function enableTotp(User $user): array
    {
        $google2fa = app('pragmarx.google2fa');
        $secret = $google2fa->generateSecretKey();

        $user->update(['totp_secret' => encrypt($secret)]);

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return [
            'secret' => $secret,
            'qr_url' => $qrCodeUrl,
        ];
    }

    public function verifyTotp(User $user, string $code): bool
    {
        $google2fa = app('pragmarx.google2fa');
        $secret = decrypt($user->totp_secret);

        $valid = $google2fa->verifyKey($secret, $code);

        if ($valid && !$user->totp_enabled) {
            $user->update(['totp_enabled' => true]);
        }

        return $valid;
    }
}
