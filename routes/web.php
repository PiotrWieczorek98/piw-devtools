<?php

use App\Http\Controllers\ToolController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'tools')->name('home');

Route::controller(ToolController::class)->prefix('tools')->name('tools.')
    ->middleware('throttle:120,1')
    ->group(function (): void {
        Route::post('pesel', 'pesel')->name('pesel');
        Route::post('nip', 'nip')->name('nip');
        Route::post('php-to-json', 'phpToJson')->name('php-to-json');
        Route::post('json-to-php', 'jsonToPhp')->name('json-to-php');
    });
