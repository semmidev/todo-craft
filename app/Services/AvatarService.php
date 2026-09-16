<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class AvatarService
{
    /**
     * Get the default storage disk for avatars.
     */
    public function getDiskName(): string
    {
        return config('filesystems.default', 's3');
    }

    /**
     * Download an external image URL (e.g. Google avatar) and store it in S3 / storage.
     *
     * @return string|null The relative storage key (e.g. avatars/uuid.jpg)
     */
    public function downloadAndStoreFromUrl(string $url): ?string
    {
        try {
            $response = Http::timeout(10)->get($url);

            if (! $response->successful()) {
                Log::warning('Failed to fetch avatar from URL: '.$url, ['status' => $response->status()]);

                return null;
            }

            $content = $response->body();

            if (empty($content)) {
                return null;
            }

            $contentType = $response->header('Content-Type');
            $extension = match ($contentType) {
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
                default => 'jpg',
            };

            $uuid = (string) Str::uuid();
            $key = "avatars/{$uuid}.{$extension}";

            $disk = Storage::disk($this->getDiskName());
            $disk->put($key, $content, 'public');

            return $key;
        } catch (Throwable $e) {
            Log::error('Error downloading and storing avatar: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Process a presigned temporary upload key (e.g. tmp/uuid/file.png) and move it to permanent avatars storage.
     *
     * @return string|null The permanent storage key (e.g. avatars/uuid.png)
     */
    public function storeFromTmpKey(string $tmpKey, ?string $oldAvatarKey = null): ?string
    {
        $diskName = $this->getDiskName();
        $disk = Storage::disk($diskName);

        if (! $disk->exists($tmpKey)) {
            return null;
        }

        $extension = pathinfo($tmpKey, PATHINFO_EXTENSION) ?: 'jpg';
        $uuid = (string) Str::uuid();
        $newKey = "avatars/{$uuid}.{$extension}";

        $disk->copy($tmpKey, $newKey);
        $disk->delete($tmpKey);

        if ($oldAvatarKey) {
            $this->deleteAvatar($oldAvatarKey);
        }

        return $newKey;
    }

    /**
     * Delete an existing avatar file from storage.
     */
    public function deleteAvatar(?string $avatarKey): void
    {
        if (! $avatarKey) {
            return;
        }

        if (str_starts_with($avatarKey, 'http://') || str_starts_with($avatarKey, 'https://')) {
            return;
        }

        $disk = Storage::disk($this->getDiskName());

        if ($disk->exists($avatarKey)) {
            $disk->delete($avatarKey);
        }
    }
}
