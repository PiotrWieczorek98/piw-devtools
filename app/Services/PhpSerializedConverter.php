<?php

namespace App\Services;

use ErrorException;
use InvalidArgumentException;
use JsonException;

class PhpSerializedConverter
{
    /**
     * Convert a PHP serialized string into JSON.
     *
     * @throws InvalidArgumentException
     */
    public function toJson(string $input): string
    {
        try {
            // allowed_classes=false: pasted input must never instantiate application classes.
            $value = unserialize($input, ['allowed_classes' => false]);
        } catch (ErrorException $exception) {
            throw new InvalidArgumentException($exception->getMessage(), $exception->getCode(), previous: $exception);
        }

        if ($value === false && $input !== serialize(false)) {
            throw new InvalidArgumentException('Invalid PHP serialized string.');
        }

        try {
            return json_encode($this->normalize($value), JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PRESERVE_ZERO_FRACTION);
        } catch (JsonException $exception) {
            throw new InvalidArgumentException($exception->getMessage(), $exception->getCode(), previous: $exception);
        }
    }

    /**
     * Convert JSON into a PHP serialized string; objects carrying "__class" become serialized objects of that class.
     *
     * @throws InvalidArgumentException
     */
    public function fromJson(string $json): string
    {
        try {
            $value = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new InvalidArgumentException($exception->getMessage(), $exception->getCode(), previous: $exception);
        }

        return $this->serialize($value);
    }

    private function serialize(mixed $value): string
    {
        if (! is_array($value)) {
            return serialize($value);
        }

        $class = $value['__class'] ?? null;

        if (is_string($class)) {
            unset($value['__class']);
        } else {
            $class = null;
        }

        $body = count($value).':{';

        foreach ($value as $key => $item) {
            $body .= serialize($key).$this->serialize($item);
        }

        return ($class === null ? 'a:' : 'O:'.strlen($class).':"'.$class.'":').$body.'}';
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
