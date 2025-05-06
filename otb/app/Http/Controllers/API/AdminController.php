<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\User;
use App\Models\Question;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AdminController extends Controller
{
    public function generateQuestions(Request $request)
    {
        $request->validate([
            'test_id' => 'required|exists:tests,id',
            'topic' => 'required',
            'class' => 'required',
            'num_questions' => 'required|numeric'
        ]);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.env('OPENAI_API_KEY'),
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [[
                'role' => 'user',
                'content' => "Generate {$request->num_questions} multiple choice questions about {$request->topic} for class {$request->class} students. Each question should have 4 options with 1 correct answer. Format as JSON: { questions: [ { question: '', options: [], correct_answer: '' } ] }"
            ]]
        ]);

        // Process response and save questions
        $questions = json_decode($response->json()['choices'][0]['message']['content'], true);

        foreach ($questions['questions'] as $q) {
            Question::create([
                'test_id' => $request->test_id,
                'question' => $q['question'],
                'options' => $q['options'],
                'correct_answer' => $q['correct_answer']
            ]);
        }

        return response()->json(['message' => 'Questions generated successfully']);
    }

    public function getResults($testId)
    {
        $results = Result::with('user')->where('test_id', $testId)->get();
        return response()->json($results);
    }

    public function getDashboardStats()
    {
        return response()->json([
            'total_tests' => Test::count(),
            'active_tests' => Test::where('start_time', '<=', now())
                ->whereRaw("DATE_ADD(start_time, INTERVAL duration MINUTE) >= NOW()")
                ->count(),
            'completed_tests' => Test::whereRaw("DATE_ADD(start_time, INTERVAL duration MINUTE) < NOW()")
                ->count(),
            'total_students' => User::where('role', 'student')->count(),
            'upcoming_tests' => Test::where('start_time', '>', now())->count()
        ]);
    }
}
