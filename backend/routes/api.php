<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AwsController;

Route::post('/generate-test', [AwsController::class, 'generateTest']);
Route::post('/test', [AwsController::class, 'test']);
