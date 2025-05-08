<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\Result;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;



class TestController extends Controller
{
    public function index()
    {
        return Test::withCount('questions')->paginate(10);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'class' => 'required|string',
            'start_time' => 'required|date',
            'duration' => 'required|integer|min:1',
            // 'end_time' => 'required|date|after:start_time'
        ]);

        $test = Test::create(array_merge($validated, [
            'created_by' => auth()->id()
        ]));
        return response()->json($test, 201);
    }

    public function update(Request $request, Test $test)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'class' => 'sometimes|string',
            'start_time' => 'sometimes|date',
            'duration' => 'sometimes|integer|min:1',
            // 'end_time' => 'sometimes|date|after:start_time'
        ]);

        $test->update($validated);
        return response()->json($test);
    }

    public function destroy(Test $test)
    {
        $test->delete();
        return response()->json(null, 204);
    }



    public function show(Request $request, Test $test)
    {
        $student = $request->user();

        // Verify student class matches test class
        if ($student->class !== $test->class) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'test' => $test->load('questions'),
            'has_attempted' => $test->results()->where('user_id', $student->id)->exists(),
            'time_remaining' => now()->diffInSeconds($test->start_time, false)
        ]);
    }



    public function getTestDetails(Request $request, Test $test)
    {
        $student = $request->user();

        // Verify student's class matches test class
        if ($student->class !== $test->class) {
            return response()->json(['message' => 'Unauthorized for this test'], 403);
        }

        // Calculate test timings
        $now = Carbon::now();
        $startTime = Carbon::parse($test->start_time);
        $endTime = $startTime->copy()->addMinutes($test->duration);

        // Check if test has started
        if ($now < $startTime) {
            return response()->json([
                'message' => 'Test has not started yet',
                'scheduled_start' => $startTime->toIso8601String()
            ], 403);
        }

        // Check if test has ended
        if ($now > $endTime) {
            return response()->json([
                'message' => 'Test has ended',
                'ended_at' => $endTime->toIso8601String()
            ], 403);
        }

        // Get test details with questions (without answers)
        $test->load(['questions' => function($query) {
            $query->select('id', 'test_id', 'question', 'options');
        }]);

        return response()->json([
            'test' => $test->makeHidden(['created_at', 'updated_at', 'created_by']),
            'time_remaining' => $endTime->diffInSeconds($now),
            'has_attempted' => $test->results()->where('user_id', $student->id)->exists()
        ]);
    }

    public function submitTest(Request $request, Test $test)
{
    DB::beginTransaction();

    try {
        $student = $request->user();
        $now = Carbon::now();

        // Validate student authorization
        if ($student->class !== $test->class) {
            return response()->json(['message' => 'Unauthorized for this test'], 403);
        }

        // Validate test availability
        $endTime = Carbon::parse($test->start_time)->addMinutes($test->duration);
        if ($now->gt($endTime)) {
            return response()->json([
                'message' => 'Test submission period has ended',
                'ended_at' => $endTime->toIso8601String()
            ], 403);
        }

        // Prevent multiple submissions
        if ($test->results()->where('user_id', $student->id)->exists()) {
            return response()->json(['message' => 'Test already submitted'], 409);
        }

        // Validate request format
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|string|max:255'
        ]);

        // Calculate score
        $questions = $test->questions()->pluck('correct_answer', 'id');
        $score = collect($validated['answers'])
            ->filter(fn ($answer, $questionId) =>
                $questions->has($questionId) &&
                $answer === $questions[$questionId]
            )->count();

        // Store result
        $result = $student->results()->create([
            'test_id' => $test->id,
            'score' => $score,
            'total_questions' => $questions->count(),
            'answers' => $validated['answers'],
            'submitted_at' => $now
        ]);

        DB::commit();

        return response()->json([
            'score' => $score,
            'total_questions' => $questions->count(),
            'percentage' => round(($score / $questions->count()) * 100, 2),
            'result_id' => $result->id,
            'submitted_at' => $now->toIso8601String()
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Invalid submission format',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Submission failed',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
