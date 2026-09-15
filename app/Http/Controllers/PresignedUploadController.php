<?php

namespace App\Http\Controllers;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class PresignedUploadController extends Controller
{
    /**
     * Generate a presigned upload URL for direct client file uploads.
     */
    public function generateUrl(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'filename' => ['required', 'string', 'max:255'],
            'file_type' => ['required', 'string', 'max:127'],
            'size' => ['required', 'integer', 'max:104857600'], // 100 MB max
        ]);

        $uuid = (string) Str::uuid();
        $extension = pathinfo($validated['filename'], PATHINFO_EXTENSION);
        $nameWithoutExt = pathinfo($validated['filename'], PATHINFO_FILENAME);
        $sanitizedFilename = Str::slug($nameWithoutExt).($extension ? '.'.strtolower($extension) : '');

        $key = "tmp/{$uuid}/{$sanitizedFilename}";
        $diskName = config('filesystems.default', 'local');

        if ($diskName === 's3') {
            /** @var FilesystemAdapter $disk */
            $disk = Storage::disk('s3');
            $uploadUrl = $disk->temporaryUploadUrl(
                $key,
                now()->addMinutes(15),
                ['ResponseContentType' => $validated['file_type']]
            );

            return response()->json([
                'upload_url' => $uploadUrl,
                'key' => $key,
                'disk' => 's3',
                'headers' => [
                    'Content-Type' => $validated['file_type'],
                ],
            ]);
        }

        // Fallback for local development / testing without S3 credentials configured
        $uploadUrl = URL::temporarySignedRoute(
            'upload.local',
            now()->addMinutes(15),
            [
                'uuid' => $uuid,
                'filename' => $sanitizedFilename,
            ]
        );

        return response()->json([
            'upload_url' => $uploadUrl,
            'key' => $key,
            'disk' => $diskName,
            'headers' => [
                'Content-Type' => $validated['file_type'],
            ],
        ]);
    }

    /**
     * Handle local signed PUT upload (dev/testing fallback when S3 is disabled).
     */
    public function uploadLocal(Request $request, string $uuid, string $filename): JsonResponse
    {
        if (! $request->hasValidSignature()) {
            return response()->json(['message' => 'Invalid or expired upload signature.'], 401);
        }

        $key = "tmp/{$uuid}/{$filename}";
        $stream = fopen('php://input', 'rb');

        if ($stream === false) {
            return response()->json(['message' => 'Unable to read upload stream.'], 500);
        }

        $disk = Storage::disk(config('filesystems.default', 'local'));
        $disk->writeStream($key, $stream);

        if (is_resource($stream)) {
            fclose($stream);
        }

        return response()->json([
            'success' => true,
            'key' => $key,
            'size' => $disk->size($key),
        ]);
    }
}
