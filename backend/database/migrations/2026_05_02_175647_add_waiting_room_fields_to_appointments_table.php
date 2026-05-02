<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWaitingRoomFieldsToAppointmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('queue_status')->nullable()->comment('waiting, in_consultation, finished');
            $table->timestamp('arrival_time')->nullable();
            $table->timestamp('consultation_start_time')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['queue_status', 'arrival_time', 'consultation_start_time']);
        });
    }
}
