<?php

namespace Tests\Feature;

use Tests\TestCase;

class ToolControllerTest extends TestCase
{
    public function test_generates_valid_pesel_numbers_for_given_birth_date_and_sex(): void
    {
        $response = $this->postJson(route('tools.pesel'), ['count' => 20, 'birth_date' => '2001-05-07', 'sex' => 'female']);

        $response->assertOk()->assertJsonCount(20, 'numbers');

        foreach ($response->json('numbers') as $pesel) {
            $this->assertMatchesRegularExpression('/^012507\d{5}$/', $pesel);
            $this->assertSame(0, (int) $pesel[9] % 2, 'Female PESEL must have an even sex digit.');
            $this->assertSame(0, $this->weightedSum($pesel, [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1]) % 10);
        }
    }

    public function test_pesel_encodes_century_in_month(): void
    {
        $pesel = $this->postJson(route('tools.pesel'), ['count' => 1, 'birth_date' => '1899-12-31', 'sex' => 'male'])->json('numbers.0');

        $this->assertStringStartsWith('999231', $pesel);
        $this->assertSame(1, (int) $pesel[9] % 2);
    }

    public function test_generates_valid_nip_numbers(): void
    {
        $response = $this->postJson(route('tools.nip'), ['count' => 50]);

        $response->assertOk()->assertJsonCount(50, 'numbers');

        foreach ($response->json('numbers') as $nip) {
            $this->assertMatchesRegularExpression('/^[1-9]\d{9}$/', $nip);
            $this->assertSame((int) $nip[9], $this->weightedSum(substr($nip, 0, 9), [6, 5, 7, 2, 3, 4, 5, 6, 7]) % 11);
        }
    }

    public function test_rejects_invalid_generator_options(): void
    {
        $this->postJson(route('tools.pesel'), ['count' => 101, 'sex' => 'other'])->assertJsonValidationErrors(['count', 'sex']);
        $this->postJson(route('tools.nip'), ['count' => 0])->assertJsonValidationErrors(['count']);
    }

    public function test_converts_php_serialized_data_to_json_preserving_key_order(): void
    {
        $input = serialize(['b' => 1, 5 => 'x', 2 => [1.0, true, null], 'pl' => 'zażółć']);

        $this->postJson(route('tools.php-to-json'), ['input' => $input])
            ->assertOk()
            ->assertExactJson(['json' => '{"b":1,"5":"x","2":[1.0,true,null],"pl":"zażółć"}']);
    }

    public function test_converts_objects_without_instantiating_them(): void
    {
        $input = 'O:9:"App\Thing":2:{s:17:"'."\0App\Thing\0".'secret";s:1:"a";s:7:"'."\0*\0".'prot";i:1;}';

        $this->postJson(route('tools.php-to-json'), ['input' => $input])
            ->assertOk()
            ->assertExactJson(['json' => '{"__class":"App\\\\Thing","secret":"a","prot":1}']);
    }

    public function test_reports_invalid_serialized_input(): void
    {
        $this->postJson(route('tools.php-to-json'), ['input' => 'a:1:{s:3:"ab";i:1;}'])->assertJsonValidationErrors(['input']);
        $this->postJson(route('tools.php-to-json'), ['input' => 'not serialized'])->assertJsonValidationErrors(['input']);
    }

    public function test_accepts_serialized_false(): void
    {
        $this->postJson(route('tools.php-to-json'), ['input' => 'b:0;'])->assertOk()->assertExactJson(['json' => 'false']);
    }

    /**
     * @param  list<int>  $weights
     */
    private function weightedSum(string $digits, array $weights): int
    {
        return array_sum(array_map(fn (int $weight, string $digit): int => $weight * (int) $digit, $weights, str_split($digits)));
    }
}
