# Supabase produkcija — Iznenadi

## 1. Novi projekat

1. [supabase.com](https://supabase.com) → New project (region blizu korisnika, npr. EU).
2. Sačuvaj lozinku baze.

## 2. Migracije (SQL Editor)

Pokreni **redom** (kopiraj ceo fajl):

| # | Fajl |
|---|------|
| 1 | `supabase/migrations/20260615160000_init_surprises.sql` |
| 2 | `supabase/migrations/20260615170000_add_tier.sql` |
| 3 | `supabase/migrations/20260616180000_add_payment.sql` |

Ako init/tier su već pokrenuti, vidi [MIGRATE_PAYMENT.md](MIGRATE_PAYMENT.md) (samo payment kolone).

## 3. Provera

U Table Editor:
- `surprises` — kolone: `slug`, `template`, `tier`, `payload`, `status`, `payment_status`, `price_paid`, `stripe_session_id`

U Storage:
- Bucket `surprise-photos` — public, max 5 MB, image types

U Authentication → Policies (RLS):
- `surprises`: SELECT za `status = published`

Upload slika koristi **service role** na serveru — ne treba anon INSERT policy.

## 4. API keys

Project Settings → API:

| Key | Env var |
|-----|---------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` |

**Nikad** commituj service role key.

## 5. Lokalni test

```bash
cp .env.example .env.local
npm run dev
```

Kreiraj test iznenađenje na `/create` i proveri `/s/[slug]`.
