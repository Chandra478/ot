<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\Result;
use App\Models\User;

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

    public function show(Test $test)
    {
        return $test->load('questions');
    }
}
