<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'specialty',
        'license_number',
        'education',
        'experience_years',
        'consultation_fee',
        'about',
        'available_days',
        'available_time_start',
        'available_time_end',
        'status',
        'profile_picture',
        'cabinet_logo',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'available_days' => 'array',
        'available_time_start' => 'datetime:H:i',
        'available_time_end' => 'datetime:H:i',
        'consultation_fee' => 'decimal:2',
    ];

    /**
     * Get the user that owns the doctor profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the appointments for the doctor.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the reviews for the doctor.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get average rating.
     */
    public function averageRating(): float
    {
        return $this->reviews()->avg('rating') ?? 0.0;
    }
    /**
     * Get the medical records for the doctor.
     */
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }
}
