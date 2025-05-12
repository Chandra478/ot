<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Result;

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
    
}
