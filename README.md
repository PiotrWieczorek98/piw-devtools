# PIW Devtools

Small set of developer tools in the browser.

- JSON formatter with saved memory slots
- PHP serialized → JSON
- Base64 encode / decode
- PESEL and NIP generators

Built with Laravel 13, Inertia, React and Tailwind.

## Running

```sh
docker compose run --rm app composer setup
docker compose up
```

Open http://localhost:8000.

## Commands

Run inside the container (`docker compose exec app sh`):

```sh
php artisan test     # tests
composer fix         # Rector + PHP CS Fixer
composer fix:check   # same, dry run
npm run check        # frontend lint and format
```

A pre-commit hook in `.githooks` runs `fix:check` on staged PHP files. `composer install` enables it.
