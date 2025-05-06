<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    protected $fillable = [
        'id',
        'title',
        'description',
        'start_time',
        'duration',
        'class',
        'created_by',
        'created_at',
        'updated_at',
    ];
    use HasFactory;


    protected $casts = [
        'start_time' => 'datetime',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
