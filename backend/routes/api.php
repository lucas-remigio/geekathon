<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;
use App\Http\Controllers\api\PdfController;
use App\Http\Controllers\api\SubjectController;


Route::post('/submit-mcq-results', [AwsController::class, 'correctMultipleChoiceQuestions']);
Route::post('/pdfs', [PdfController::class, 'upload']);
Route::get('/pdfs', [PdfController::class, 'index']);
Route::get('/pdfs/{id}', [PdfController::class, 'show']);
Route::delete('/pdfs/{id}', [PdfController::class, 'destroy']);
Route::get('/subjects', [SubjectController::class, 'index']);
Route::get('/subjects/{id}/chapters', [SubjectController::class, 'getChapters']);
Route::get('/subjects/{id}/chapters/pdfs', [SubjectController::class, 'getPdfsFromChapters']);
Route::get('/generate-test', [AwsController::class, 'generateTest']);
Route::post('/correct-answer', [AwsController::class, 'correctExtensiveQuestion']);
Route::post('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::get('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::post('/test', [AwsController::class, 'test']);



