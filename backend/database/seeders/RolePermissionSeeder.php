<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $admin = Role::create([
            'name' => Role::ADMIN,
            'display_name' => 'Administrator',
            'description' => 'Full system access',
        ]);

        $annotator = Role::create([
            'name' => Role::ANNOTATOR,
            'display_name' => 'Annotator',
            'description' => 'Can annotate assigned tasks',
        ]);

        $clinician = Role::create([
            'name' => Role::CLINICIAN_REVIEWER,
            'display_name' => 'Clinician Reviewer',
            'description' => 'Can review and approve annotations',
        ]);

        $qa = Role::create([
            'name' => Role::QA_REVIEWER,
            'display_name' => 'QA Reviewer',
            'description' => 'Can perform quality assurance reviews',
        ]);

        // Create permissions
        $permissions = [
            // Datasets
            ['name' => 'datasets.create', 'display_name' => 'Create Datasets', 'group' => 'datasets'],
            ['name' => 'datasets.read', 'display_name' => 'View Datasets', 'group' => 'datasets'],
            ['name' => 'datasets.update', 'display_name' => 'Update Datasets', 'group' => 'datasets'],
            ['name' => 'datasets.delete', 'display_name' => 'Delete Datasets', 'group' => 'datasets'],
            ['name' => 'datasets.export', 'display_name' => 'Export Datasets', 'group' => 'datasets'],

            // Tasks
            ['name' => 'tasks.create', 'display_name' => 'Create Tasks', 'group' => 'tasks'],
            ['name' => 'tasks.read', 'display_name' => 'View Tasks', 'group' => 'tasks'],
            ['name' => 'tasks.assign', 'display_name' => 'Assign Tasks', 'group' => 'tasks'],
            ['name' => 'tasks.update', 'display_name' => 'Update Tasks', 'group' => 'tasks'],

            // Annotations
            ['name' => 'annotations.create', 'display_name' => 'Create Annotations', 'group' => 'annotations'],
            ['name' => 'annotations.read', 'display_name' => 'View Annotations', 'group' => 'annotations'],
            ['name' => 'annotations.update', 'display_name' => 'Update Annotations', 'group' => 'annotations'],
            ['name' => 'annotations.delete', 'display_name' => 'Delete Annotations', 'group' => 'annotations'],

            // Reviews
            ['name' => 'reviews.create', 'display_name' => 'Create Reviews', 'group' => 'reviews'],
            ['name' => 'reviews.read', 'display_name' => 'View Reviews', 'group' => 'reviews'],

            // Admin
            ['name' => 'users.manage', 'display_name' => 'Manage Users', 'group' => 'admin'],
            ['name' => 'audit.read', 'display_name' => 'View Audit Logs', 'group' => 'admin'],
        ];

        $permModels = [];
        foreach ($permissions as $perm) {
            $permModels[$perm['name']] = Permission::create($perm);
        }

        // Assign permissions to roles
        $admin->permissions()->attach(array_column(
            array_values($permModels),
            'id'
        ));

        $annotator->permissions()->attach([
            $permModels['datasets.read']->id,
            $permModels['tasks.read']->id,
            $permModels['tasks.update']->id,
            $permModels['annotations.create']->id,
            $permModels['annotations.read']->id,
            $permModels['annotations.update']->id,
            $permModels['annotations.delete']->id,
        ]);

        $clinician->permissions()->attach([
            $permModels['datasets.read']->id,
            $permModels['tasks.read']->id,
            $permModels['tasks.update']->id,
            $permModels['annotations.read']->id,
            $permModels['annotations.update']->id,
            $permModels['reviews.create']->id,
            $permModels['reviews.read']->id,
        ]);

        $qa->permissions()->attach([
            $permModels['datasets.read']->id,
            $permModels['tasks.read']->id,
            $permModels['annotations.read']->id,
            $permModels['reviews.create']->id,
            $permModels['reviews.read']->id,
        ]);
    }
}
