# Sigurnost — Supabase lozinke i ključevi

## Rotacija NAIS Studio DB lozinke (jednokratno)

Ako je database password ikad bio u commitu ili `.env.example` na GitHubu:

1. [Supabase Dashboard](https://supabase.com/dashboard) → projekat **NAIS Studio** (`tozyxkxmsyhyeznehjtx`)
2. **Project Settings → Database → Reset database password**
3. Sačuvaj novu lozinku u password manager
4. Ažuriraj samo lokalni [`web/.env.local`](../../../web/.env.local) (NAIS) — **nikad ne commituj**

Iznenadi koristi **poseban** Supabase projekat — vidi [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Šta nikad ne commitovati

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_ACCESS_TOKEN`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- Bilo koji `.env.local`

## Odvajanje projekata

| App | Supabase projekat |
|-----|-------------------|
| NAIS Studio (`web/`) | `tozyxkxmsyhyeznehjtx` (postojeći) |
| Iznenadi (`iznenadi/web/`) | **novi** projekat `iznenadi` |

Zajednički service role key između produkcijskih app-ova nije prihvatljiv — svaki app ima svoj projekat.
