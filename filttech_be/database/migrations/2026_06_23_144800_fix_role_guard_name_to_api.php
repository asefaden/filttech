<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration fixes the guard_name for roles that were created
     * without explicitly setting guard_name (defaulting to 'web').
     * The application uses 'api' as the default guard (JWT).
     */
    public function up(): void
    {
        DB::table('roles')
            ->where('guard_name', '!=', 'api')
            ->update(['guard_name' => 'api']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')
            ->where('guard_name', 'api')
            ->update(['guard_name' => 'web']);
    }
};