<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\TestController;
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
    });
});
