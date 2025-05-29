<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Result;
use App\Models\User;
use App\Models\Test;


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

        $results = $user->results()
            ->with('test:id,title')
            ->select('id', 'test_id', 'user_id', 'score', 'total_questions', 'answers', 'submitted_at')
            ->orderByDesc('submitted_at')
            ->get()
            ->map(function ($result) {
                $result->percentage = round(($result->score / $result->total_questions) * 100, 2);
                $result->rank = Result::where('test_id', $result->test_id)
                    ->where('score', '>', $result->score)
                    ->count() + 1;
                return $result;
            });

        return response()->json($results->map(function ($result) {
            return [
                'id' => $result->id,
                'test_title' => $result->test->title,
                'score' => $result->score,
                'test_id' => $result->test_id,
                'user_id' => $result->user_id,
                'total_questions' => $result->total_questions,
                'answers' => $result->answers,
                'submitted_at' => $result->submitted_at,
                'rank' => $result->rank,
                'percentage' => $result->percentage,
            ];
        }));
    }

      public function getRankings($testId)
    {
        $results = Result::with('user')->where('test_id', $testId)
            ->select('user_id', 'score', 'submitted_at')
            ->orderByDesc('score')
            ->orderBy('submitted_at')
            ->get();

        return response()->json($results);
    }
}
