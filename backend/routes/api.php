<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;
use App\Http\Controllers\api\FileUploadController;



Route::post('/upload-files', [FileUploadController::class, 'upload']);
Route::post('/generate-test', [AwsController::class, 'generateTest']);
Route::post('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::get('/generate-summaries', [AwsController::class, 'generateSummaries']);
Route::post('/test', [AwsController::class, 'test']);
