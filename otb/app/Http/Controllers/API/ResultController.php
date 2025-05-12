<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Result;
use App\Models\User;
use App\Models\Test;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    
    public function showResult(Request $request, Result $result)
    {
      if ($result->user_id !== auth()->id()) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $result->load(['test.questions']);

    return response()->json([
        'result' => [
            'id' => $result->id,
            'score' => $result->score,
            'total_questions' => $result->total_questions,
            'percentage' => round(($result->score / $result->total_questions) * 100, 2),
            'submitted_at' => $result->submitted_at->toIso8601String()
        ],
        'test' => $result->test->only('id', 'title', 'class'),
        'questions' => $result->test->questions->map(function($question) use ($result) {
            return [
                'question' => $question->question,
                'options' => $question->options,
                'correct_answer' => $question->correct_answer,
                'student_answer' => $result->answers[$question->id] ?? null // Access with integer key
            ];
        })
    ]);
    }


     public function studentResults(Request $request)
    {
        $user = $request->user();
        
        $results = DB::table('results')
            ->join('tests', 'results.test_id', '=', 'tests.id')
            ->where('results.user_id', $user->id)
            ->select(
                'results.id',
                'tests.title as test_title',
                'results.score',
                'results.total_questions',
                'results.submitted_at',
                DB::raw('ROUND((results.score / results.total_questions) * 100, 2) as percentage')
            )
            ->orderBy('results.submitted_at', 'desc')
            ->get();

        return response()->json($results->map(function ($result) {
            return [
                'id' => $result->id,
                'test_title' => $result->test_title,
                'score' => $result->score,
                'total_questions' => $result->total_questions,
                'percentage' => $result->percentage,
                'submitted_at' => $result->submitted_at
            ];
        }));
    }
    
}
