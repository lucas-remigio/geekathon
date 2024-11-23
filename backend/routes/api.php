<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;
use App\Http\Controllers\api\FileUploadController;



Route::post('/pdfs', [FileUploadController::class, 'upload']);
Route::get('/pdfs', [FileUploadController::class, 'index']);;
Route::post('/generate-test', [AwsController::class, 'generateTest']);
Route::post('/test', [AwsController::class, 'test']);
