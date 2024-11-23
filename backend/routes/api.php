<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;
use App\Http\Controllers\api\FileUploadController;


Route::post('/submit-mcq-results', [AwsController::class, 'correctMultipleChoiceQuestions']);
Route::post('/pdfs', [FileUploadController::class, 'upload']);
Route::get('/pdfs', [FileUploadController::class, 'index']);
Route::post('/generate-test', [AwsController::class, 'generateTest']);
Route::post('/correct-answer', [AwsController::class, 'correctExtensiveQuestion']);
Route::post('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::get('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::post('/test', [AwsController::class, 'test']);



