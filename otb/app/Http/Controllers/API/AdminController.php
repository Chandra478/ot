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


    public function getStudents(Request $request)
{
    $query = User::where('role', 'student');

    if ($request->has('class')) {
        $query->where('class', $request->class);
    }

    if ($request->has('search')) {
        $query->where(function($q) use ($request) {
            $q->where('name', 'like', '%'.$request->search.'%')
              ->orWhere('email', 'like', '%'.$request->search.'%');
        });
    }

    return $query->paginate(10);
}

public function createStudent(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'gender' => 'required|in:male,female,other',
        'class' => 'required|string',
        'password' => 'required|string|min:8'
    ]);

    $student = User::create([
        ...$validated,
        'password' => bcrypt($validated['password']),
        'role' => 'student',
        'is_approved' => true
    ]);

    return response()->json($student, 201);
}

public function updateStudent(Request $request, User $user)
{
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|email|unique:users,email,'.$user->id,
        'gender' => 'sometimes|in:male,female,other',
        'class' => 'sometimes|string',
        'password' => 'nullable|string|min:8'
    ]);

    if (isset($validated['password'])) {
        $validated['password'] = bcrypt($validated['password']);
    }

    $user->update($validated);
    return response()->json($user);
}

public function deleteStudent(User $user)
{
    $user->delete();
    return response()->noContent();
}

public function getClasses()
{
    return User::where('role', 'student')
               ->distinct('class')
               ->pluck('class');
}
}
