<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\Result;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
class StudentController extends Controller
{
    public function dashboard(Request $request)
    {
        $student = $request->user();

        return response()->json([
            'stats' => [
                'total_tests' => Test::where('class', $student->class)->count(),
                'completed_tests' => $student->results()->count(),
                'average_score' => $student->results()->avg('score'),
                'upcoming_tests' => Test::where('class', $student->class)
                    ->where('start_time', '>', now())
                    ->count()
            ],
            'recent_tests' => $student->results()
                ->with('test')
                ->orderBy('submitted_at', 'desc')
                ->take(5)
                ->get()
        ]);
    }

    public function getTests(Request $request)
    {
        $student = $request->user();
        $now = now();

        return Test::where('class', $student->class)
            ->where(function($query) use ($now) {
                $query->where('start_time', '<=', $now)
                    ->whereRaw("DATE_ADD(start_time, INTERVAL duration MINUTE) >= ?", [$now])
                    ->orWhere('start_time', '>', $now);
            })
            ->with(['results' => function($query) use ($student) {
                $query->where('user_id', $student->id);
            }])
            ->paginate(10);
    }


    public function getUpcomingTests(Request $request)
    {
        $student = $request->user();

        return Test::where('class', $student->class)
            ->where('start_time', '>', now())
            ->orderBy('start_time', 'asc')
            ->paginate(10);
    }
}
