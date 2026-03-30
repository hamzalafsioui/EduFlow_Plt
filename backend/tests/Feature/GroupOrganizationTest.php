<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Category;
use App\Models\Group;
use App\Services\GroupService;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class GroupOrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticateUser($user)
    {
        $token = JWTAuth::fromUser($user);
        return $this->withHeaders(['Authorization' => 'Bearer ' . $token]);
    }

    private function makeTeacher()
    {
        return User::factory()->create(['role' => 'teacher']);
    }

    private function makeStudent()
    {
        return User::factory()->create(['role' => 'student']);
    }

    private function makeCourse($teacher)
    {
        $category = Category::create(['name' => 'Dev', 'slug' => 'dev']);
        return Course::create([
            'title' => 'Laravel',
            'description' => 'Learn',
            'price' => 10.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id,
        ]);
    }

    public function test_student_is_automatically_assigned_to_a_group_on_enrollment()
    {
        $teacher = $this->makeTeacher();
        $student = $this->makeStudent();
        $course = $this->makeCourse($teacher);

        //  enrollment + auto-assignment
        $groupService = app(GroupService::class);
        $student->enrolledCourses()->attach($course->id);
        $groupService->assignStudentToGroup($student->id, $course->id);

        $this->assertDatabaseHas('groups', ['course_id' => $course->id, 'name' => 'Group 1']);
        $group = Group::where('course_id', $course->id)->first();
        $this->assertTrue($group->students()->where('user_id', $student->id)->exists());
    }

    public function test_new_group_is_created_when_current_group_is_full()
    {
        $teacher = $this->makeTeacher();
        $course = $this->makeCourse($teacher);
        $groupService = app(GroupService::class);

        // Fill a group with 25 students
        for ($i = 0; $i < 25; $i++) {
            $student = $this->makeStudent();
            $groupService->assignStudentToGroup($student->id, $course->id);
        }

        // The 26th student should go to Group 2
        $student26 = $this->makeStudent();
        $groupService->assignStudentToGroup($student26->id, $course->id);

        $this->assertDatabaseHas('groups', ['course_id' => $course->id, 'name' => 'Group 2']);
        $this->assertEquals(2, Group::where('course_id', $course->id)->count());
    }

    public function test_teacher_can_list_groups_for_course()
    {
        $teacher = $this->makeTeacher();
        $student = $this->makeStudent();
        $course = $this->makeCourse($teacher);

        $groupService = app(GroupService::class);
        $groupService->assignStudentToGroup($student->id, $course->id);

        $response = $this->authenticateUser($teacher)->getJson("/api/teacher/courses/{$course->id}/groups");
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['name' => 'Group 1']);
    }

    public function test_teacher_can_list_students_in_a_group()
    {
        $teacher = $this->makeTeacher();
        $student = $this->makeStudent();
        $course = $this->makeCourse($teacher);

        $groupService = app(GroupService::class);
        $groupService->assignStudentToGroup($student->id, $course->id);
        $group = Group::where('course_id', $course->id)->first();

        $response = $this->authenticateUser($teacher)->getJson("/api/teacher/courses/{$course->id}/groups/{$group->id}/students");
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['id' => $student->id]);
    }
}
