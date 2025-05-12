<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    use HasFactory;


    protected $fillable = [
        'user_id',
        'test_id',
        'score',
        'total_questions',
        'answers',
        'submitted_at',
    ];
    protected $casts = [
        'answers' => 'array',
        'submitted_at' => 'datetime',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function test()
    {
        return $this->belongsTo(Test::class);
    }
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
