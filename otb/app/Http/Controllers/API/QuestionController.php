<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Test;
use GuzzleHttp\Client;
use App\Models\Question;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
class QuestionController extends Controller
{
    protected $openRouteApiKey;
    protected $client;

    public function __construct()
    {
        $this->openRouteApiKey = env('OPENROUTE_API_KEY');
        $this->client = new Client([
            'base_uri' => 'https://openrouter.ai/api/v1/',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->openRouteApiKey,
                'Content-Type' => 'application/json',
            ],
        ]);
    }
    public function index(Test $test)
    {
        return $test->questions()->orderByDesc('id')->paginate(10);
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

    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'difficulty' => 'sometimes|string|in:easy,medium,hard',
        ]);

        $topic = $request->input('topic');
        $difficulty = $request->input('difficulty', 'medium');
        $testId = $request->input('testId');
        try {
            $prompt = $this->buildPrompt($topic, $difficulty);

            $response = $this->client->post('chat/completions', [
                'json' => [
                    'model' => 'mistralai/mistral-7b-instruct:free',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'temperature' => 0.7,
                ]
            ]);

            $responseData = json_decode($response->getBody(), true);
            $generatedContent = $responseData['choices'][0]['message']['content'] ?? '';

            // Parse the response into a structured format
            $questionData = $this->parseGeneratedContent($generatedContent);
            $question = Question::create([
                'test_id' => $testId,
                'question' => $questionData['question'],
                'options' => $questionData['options'],
                'correct_answer' => $questionData['correct_answer']
            ]);

            return response()->json([
                'success' => true,
                'question' => $questionData
            ]);

        } catch (\Exception $e) {
            Log::error('Question generation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate question. Please try again.'.$e->getMessage()
            ], 500);
        }
    }

    protected function buildPrompt($topic, $difficulty)
    {
        return <<<PROMPT
    Generate a multiple-choice question about {$topic} with 4 options and indicate the correct answer.
    The question should be of {$difficulty} difficulty.

    Format your response exactly like this example:

    Question: What is the capital of France?
    A. London
    B. Berlin
    C. Paris
    D. Madrid
    Correct Answer: C

    Now generate a question about {$topic}:
    PROMPT;
    }

    protected function parseGeneratedContent($content)
    {
        $question = '';
        $options = [];
        $correctAnswer = '';

        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            if (str_starts_with($line, 'Question:')) {
                $question = trim(substr($line, 9));
            } elseif (preg_match('/^[A-D]\./', $line)) {
                $options[] = trim(substr($line, 3));
            } elseif (str_starts_with($line, 'Correct Answer:')) {
                $correctAnswer = trim(substr($line, 15));
            }
        }

        return [
            'question' => $question,
            'options' => $options,
            'correct_answer' => $options[ord($correctAnswer) - 65]
            // 'correct_answer' => $correctAnswer
        ];
    }
}
