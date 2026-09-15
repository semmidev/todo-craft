<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->ensureStorageBucketExists();

        Gate::define('viewHorizon', function ($user = null) {
            return app()->isLocal() || ($user?->hasRole('admin') || $user?->hasPermissionTo('access admin dashboard'));
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Ensure local S3 (RustFS) bucket and public read policy exist in development.
     */
    protected function ensureStorageBucketExists(): void
    {
        if (app()->isLocal() && config('filesystems.default') === 's3') {
            try {
                $client = Storage::disk('s3')->getClient();
                $bucket = config('filesystems.disks.s3.bucket', 'laravel');

                $client->createBucket(['Bucket' => $bucket]);

                $policy = [
                    'Version' => '2012-10-17',
                    'Statement' => [
                        [
                            'Effect' => 'Allow',
                            'Principal' => '*',
                            'Action' => ['s3:GetObject'],
                            'Resource' => ["arn:aws:s3:::{$bucket}/*"],
                        ],
                    ],
                ];

                $client->putBucketPolicy([
                    'Bucket' => $bucket,
                    'Policy' => json_encode($policy),
                ]);
            } catch (\Throwable $e) {
                // Ignore if bucket/policy exists or service unavailable during boot
            }
        }
    }
}
