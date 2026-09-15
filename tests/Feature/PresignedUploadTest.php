<?php

use App\Actions\Teams\CreateTeam;
use App\Models\Todo;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->user = User::factory()->create();

    $this->team = app(CreateTeam::class)->handle(
        $this->user,
        'Upload Test Team',
        isPersonal: true,
        slug: 'upload-test-team'
    );
});

test('authenticated user can request presigned upload url', function () {
    $response = $this->actingAs($this->user)
        ->postJson(route('upload.presigned-url'), [
            'filename' => 'test-document.pdf',
            'file_type' => 'application/pdf',
            'size' => 1024,
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'upload_url',
            'key',
            'disk',
            'headers' => ['Content-Type'],
        ]);
});

test('guest user cannot request presigned upload url', function () {
    $response = $this->postJson(route('upload.presigned-url'), [
        'filename' => 'test-document.pdf',
        'file_type' => 'application/pdf',
        'size' => 1024,
    ]);

    $response->assertStatus(401);
});

test('local signed upload route saves file content to storage', function () {
    Storage::fake('local');

    $uuid = (string) Str::uuid();
    $filename = 'sample.txt';
    $content = 'Hello Presigned Upload!';

    $signedUrl = URL::temporarySignedRoute(
        'upload.local',
        now()->addMinutes(15),
        [
            'uuid' => $uuid,
            'filename' => $filename,
        ]
    );

    $response = $this->call('PUT', $signedUrl, [], [], [], [], $content);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'key' => "tmp/{$uuid}/{$filename}",
        ]);

    Storage::disk(config('filesystems.default', 'local'))->assertExists("tmp/{$uuid}/{$filename}");
});

test('todo task can attach files uploaded via presigned URL key', function () {
    Storage::fake('local');

    $disk = config('filesystems.default', 'local');
    $uuid = (string) Str::uuid();
    $key = "tmp/{$uuid}/mock-attachment.txt";

    Storage::disk($disk)->put($key, 'Attachment File Content');

    $response = $this->actingAs($this->user)
        ->post("/{$this->team->slug}/todos", [
            'title' => 'Todo with Presigned Attachment',
            'status' => 'pending',
            'priority' => 'high',
            'attachment_keys' => [
                ['key' => $key],
            ],
        ]);

    $response->assertRedirect();

    $todo = Todo::where('title', 'Todo with Presigned Attachment')->firstOrFail();
    expect($todo->getMedia('attachments'))->toHaveCount(1);
});
