<?php

namespace App\Services;

use Carbon\CarbonImmutable;

class PolishIdentifierGenerator
{
    /**
     * Generate a valid PESEL number for the given birth date (random when null) and sex ("any", "male" or "female").
     */
    public function pesel(?string $birthDate, string $sex): string
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

    /**
     * Generate a valid NIP number.
     */
    public function nip(): string
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
}
