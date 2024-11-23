<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;
use App\Http\Controllers\api\PdfController;


Route::post('/submit-mcq-results', [AwsController::class, 'correctMultipleChoiceQuestions']);
Route::post('/pdfs', [PdfController::class, 'upload']);
Route::get('/pdfs', [PdfController::class, 'index']);
Route::get('/pdfs/{id}', [PdfController::class, 'show']);
Route::post('/generate-test', [AwsController::class, 'generateTest']);
Route::post('/correct-answer', [AwsController::class, 'correctExtensiveQuestion']);
Route::post('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::get('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::post('/test', [AwsController::class, 'test']);



