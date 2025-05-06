<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\Question;
use Illuminate\Support\Facades\Http;
class QuestionController extends Controller
{
    public function index(Test $test)
    {
        return $test->questions()->paginate(10);
    }

    public function store(Request $request, Test $test)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|min:4|max:4',
            'correct_answer' => 'required|string|in_array:options.*'
        ]);

        return $test->questions()->create($validated);
    }

    public function update(Request $request, Test $test, Question $question)
    {
        $validated = $request->validate([
            'question' => 'sometimes|string',
            'options' => 'sometimes|array|min:4|max:4',
            'correct_answer' => 'sometimes|string|in_array:options.*'
        ]);

        $question->update($validated);
        return $question;
    }

    public function destroy(Test $test, Question $question)
    {
        $question->delete();
        return response()->noContent();
    }

    public function generate(Test $test, Request $request)
    {
        $request->validate([
            'topic' => 'required|string',
            'count' => 'required|integer|min:1|max:20'
        ]);

        $response = Http::withToken(config('services.openai.key'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [[
                    'role' => 'user',
                    'content' => "Generate {$request->count} multiple choice questions about {$request->topic}. Each should have 4 options with 1 correct answer. Format as JSON: {questions: [{question: '', options: [], correct_answer: ''}]}"
                ]]
            ]);

        $questions = json_decode($response->json('choices.0.message.content'), true)['questions'];

        foreach ($questions as $q) {
            $test->questions()->create([
                'question' => $q['question'],
                'options' => $q['options'],
                'correct_answer' => $q['correct_answer']
            ]);
        }

        return response()->json(['message' => 'Questions generated successfully']);
    }
}
