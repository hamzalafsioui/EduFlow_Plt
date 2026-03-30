<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Web Development', 'slug' => 'web-development'],
            ['name' => 'Data Science', 'slug' => 'data-science'],
            ['name' => 'Mobile Development', 'slug' => 'mobile-development'],
            ['name' => 'Design', 'slug' => 'design'],
            ['name' => 'Marketing', 'slug' => 'marketing'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
