<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetTeamUrlDefaults;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'livewire/*',
            'livewire-*',
            'upload/local/*',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetTeamUrlDefaults::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (UniqueConstraintViolationException $e, Request $request) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Data with this identifier already exists. Please choose a different name or value.'),
            ]);

            return back()->withErrors([
                'name' => __('This value has already been taken.'),
                'error' => __('Data already exists (duplicate entry).'),
            ]);
        });

        $exceptions->respond(function ($response, Throwable $exception, Request $request) {
            if ($response->getStatusCode() === 403 && ! $request->is('api/*')) {
                return Inertia::render('error', [
                    'status' => 403,
                    'message' => $exception->getMessage() ?: __('You do not have permission to access this resource or perform this action in this team space.'),
                ])->toResponse($request)->setStatusCode(403);
            }

            return $response;
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
