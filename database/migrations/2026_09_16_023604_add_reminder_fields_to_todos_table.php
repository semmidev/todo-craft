<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->integer('reminder_offset')->nullable()->after('due_date')->comment('Reminder offset in minutes before due_date');
            $table->timestamp('reminder_at')->nullable()->after('reminder_offset')->index();
            $table->boolean('reminder_sent')->default(false)->after('reminder_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropColumn(['reminder_offset', 'reminder_at', 'reminder_sent']);
        });
    }
};
