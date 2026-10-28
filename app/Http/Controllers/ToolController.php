<?php

namespace App\Http\Controllers;

use App\Services\PhpSerializedConverter;
use App\Services\PolishIdentifierGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class ToolController extends Controller
{
    /**
     * Generate valid Polish PESEL numbers.
     */
    public function pesel(Request $request, PolishIdentifierGenerator $generator): JsonResponse
    {
        $validated = $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'birth_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:1800-01-01', 'before_or_equal:2299-12-31'],
            'sex' => ['required', Rule::in(['any', 'male', 'female'])],
        ]);

        $numbers = array_map(
            fn (): string => $generator->pesel($validated['birth_date'] ?? null, $validated['sex']),
            range(1, $validated['count']),
        );

        return response()->json(['numbers' => $numbers]);
    }

    /**
     * Generate valid Polish NIP numbers.
     */
    public function nip(Request $request, PolishIdentifierGenerator $generator): JsonResponse
    {
        $validated = $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $numbers = array_map(fn (): string => $generator->nip(), range(1, $validated['count']));

        return response()->json(['numbers' => $numbers]);
    }

    /**
     * Convert a PHP serialized string into JSON.
     */
    public function phpToJson(Request $request, PhpSerializedConverter $converter): JsonResponse
    {
        $validated = $request->validate([
            'input' => ['required', 'string', 'max:1000000'],
        ]);

        try {
            $json = $converter->toJson($validated['input']);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['input' => $exception->getMessage()]);
        }

        return response()->json(['json' => $json]);
    }

    /**
     * Convert JSON into a PHP serialized string.
     */
    public function jsonToPhp(Request $request, PhpSerializedConverter $converter): JsonResponse
    {
        $validated = $request->validate([
            'input' => ['required', 'string', 'max:1000000'],
        ]);

        try {
            $php = $converter->fromJson($validated['input']);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['input' => $exception->getMessage()]);
        }

        return response()->json(['php' => $php]);
    }
}
