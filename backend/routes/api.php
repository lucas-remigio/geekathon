<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;

Route::post('/extract-data', [AwsController::class, 'extractData']);
Route::post('/test', [AwsController::class, 'test']);
