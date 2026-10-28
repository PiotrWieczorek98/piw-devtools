<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use ErrorException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use JsonException;

class ToolController extends Controller
{
    /**
     * Generate valid Polish PESEL numbers.
     */
    public function pesel(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'birth_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:1800-01-01', 'before_or_equal:2299-12-31'],
            'sex' => ['required', Rule::in(['any', 'male', 'female'])],
        ]);

        $numbers = [];

        for ($i = 0; $i < $validated['count']; $i++) {
            $numbers[] = $this->generatePesel($validated['birth_date'] ?? null, $validated['sex']);
        }

        return response()->json(['numbers' => $numbers]);
    }

    /**
     * Generate valid Polish NIP numbers.
     */
    public function nip(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $numbers = [];

        for ($i = 0; $i < $validated['count']; $i++) {
            $numbers[] = $this->generateNip();
        }

        return response()->json(['numbers' => $numbers]);
    }

    /**
     * Convert a PHP serialized string into JSON.
     */
    public function phpToJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'input' => ['required', 'string'],
        ]);

        try {
            // allowed_classes=false: pasted input must never instantiate application classes.
            $value = unserialize($validated['input'], ['allowed_classes' => false]);
        } catch (ErrorException $exception) {
            throw ValidationException::withMessages(['input' => $exception->getMessage()]);
        }

        if ($value === false && $validated['input'] !== serialize(false)) {
            throw ValidationException::withMessages(['input' => 'Invalid PHP serialized string.']);
        }

        try {
            $json = json_encode($this->normalize($value), JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PRESERVE_ZERO_FRACTION);
        } catch (JsonException $exception) {
            throw ValidationException::withMessages(['input' => $exception->getMessage()]);
        }

        return response()->json(['json' => $json]);
    }

    private function generatePesel(?string $birthDate, string $sex): string
    {
        $date = $birthDate !== null
            ? CarbonImmutable::parse($birthDate)
            : CarbonImmutable::createFromTimestamp(random_int(strtotime('1950-01-01'), strtotime('2005-12-31')));

        $monthOffset = [18 => 80, 19 => 0, 20 => 20, 21 => 40, 22 => 60][intdiv($date->year, 100)];

        $sexDigit = match ($sex) {
            'male' => random_int(0, 4) * 2 + 1,
            'female' => random_int(0, 4) * 2,
            default => random_int(0, 9),
        };

        $digits = sprintf('%02d%02d%02d%03d%d', $date->year % 100, $date->month + $monthOffset, $date->day, random_int(0, 999), $sexDigit);

        return $digits.((10 - $this->weightedSum($digits, [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]) % 10) % 10);
    }

    private function generateNip(): string
    {
        do {
            $digits = random_int(1, 9).sprintf('%08d', random_int(0, 99_999_999));
            $checksum = $this->weightedSum($digits, [6, 5, 7, 2, 3, 4, 5, 6, 7]) % 11;
        } while ($checksum === 10);

        return $digits.$checksum;
    }

    /**
     * @param  list<int>  $weights
     */
    private function weightedSum(string $digits, array $weights): int
    {
        return array_sum(array_map(fn (int $weight, string $digit): int => $weight * (int) $digit, $weights, str_split($digits)));
    }

    /**
     * Turn unserialized incomplete objects into arrays carrying their class name.
     */
    private function normalize(mixed $value): mixed
    {
        if (is_object($value)) {
            $properties = (array) $value;
            $normalized = ['__class' => $properties['__PHP_Incomplete_Class_Name'] ?? $value::class];
            unset($properties['__PHP_Incomplete_Class_Name']);

            foreach ($properties as $key => $property) {
                // Private and protected property names are prefixed with "\0Class\0" or "\0*\0".
                $normalized[preg_replace('/^\0.+\0/', '', (string) $key)] = $this->normalize($property);
            }

            return $normalized;
        }

        return is_array($value) ? array_map($this->normalize(...), $value) : $value;
    }
}
