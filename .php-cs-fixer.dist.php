<?php

use Jubeki\LaravelCodeStyle\Config;
use PhpCsFixer\Finder;

return (new Config)
    ->setFinder(
        Finder::create()
            ->in([
                __DIR__.'/app',
                __DIR__.'/bootstrap',
                __DIR__.'/config',
                __DIR__.'/database',
                __DIR__.'/routes',
                __DIR__.'/tests',
            ])
            ->notPath('cache')
            ->append([__DIR__.'/rector.php', __DIR__.'/.php-cs-fixer.dist.php'])
    )
    ->setRiskyAllowed(true);
