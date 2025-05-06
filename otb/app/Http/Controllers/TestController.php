<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\Result;
use App\Models\User;
class TestController extends Controller
{
    public function forceSubmitExpiredTests()
{
    $expiredTests = Test::where('start_time', '<=', now()->subMinutes(120))
        ->whereDoesntHave('results', function($query) {
            $query->where('user_id', auth()->id());
        })
        ->get();

    foreach ($expiredTests as $test) {
        Result::create([
            'user_id' => auth()->id(),
            'test_id' => $test->id,
            'score' => 0,
            'submitted_at' => now()
        ]);
    }
}
}
