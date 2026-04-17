<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // Create default admin user
        $adminRole = Role::where('name', Role::ADMIN)->first();

        User::create([
            'name' => 'Admin',
            'email' => 'admin@ennlabel.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
            'email_verified_at' => now(),
        ]);
    }
}
