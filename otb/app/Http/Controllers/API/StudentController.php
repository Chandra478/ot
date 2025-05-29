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
                'average_score' => number_format($student->results()->avg('score'), 2),
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

         public function getProfile(Request $request)
    {
        $student = $request->user();

        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'class' => $student->class,
            'gender' => $student->gender,
            'registration_date' => $student->created_at->format('d M Y'),
            'avatar' => $student->avatar_url // Add this field if you have avatars
        ]);
    }



    public function updateProfile(Request $request)
    {
        $student = $request->user();
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,'.$student->id,
            'gender' => 'in:male,female,other',
            'class' => 'string',
            'password' => 'nullable|string|min:8|confirmed',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        

        if ($request->has('password') && $request->password != '') {
            $validated['password'] = bcrypt($request->password);
        }

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        }

        try {
            $student->update($validated);
            return response()->json($student);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
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
