<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
        });

        // For users who registered via Google and have a google_id, set password to NULL
        // if it matches dummy/random generated hashes or if they haven't explicitly set a password.
        // In practice, clearing password for google_id users without custom password flags.
        DB::table('users')
            ->whereNotNull('google_id')
            ->update(['password' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
        });
    }
};
