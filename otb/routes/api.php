<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\TestController;
use App\Http\Controllers\API\QuestionController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Student routes
    Route::get('/tests', [TestController::class, 'getAvailableTests']);
    Route::post('/submit-test', [TestController::class, 'submitTest']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::post('/create-test', [AdminController::class, 'createTest']);
        Route::post('/generate-questions', [AdminController::class, 'generateQuestions']);
        Route::get('/test-results/{testId}', [AdminController::class, 'getResults']);
        Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);
        Route::apiResource('tests', TestController::class);
        Route::prefix('tests/{test}')->group(function () {
            Route::apiResource('questions', QuestionController::class);
            Route::post('/generate-questions', [QuestionController::class, 'generate']);
        });

        });

        Route::middleware(['auth:sanctum', 'admin'])->group(function () {
            // Student Management
            Route::get('/admin/students', [AdminController::class, 'getStudents']);
            Route::post('/admin/students', [AdminController::class, 'createStudent']);
            Route::put('/admin/students/{user}', [AdminController::class, 'updateStudent']);
            Route::delete('/admin/students/{user}', [AdminController::class, 'deleteStudent']);
            Route::get('/admin/classes', [AdminController::class, 'getClasses']);
        });
});
