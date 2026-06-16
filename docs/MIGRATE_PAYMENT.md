# Kako pokrenuti payment migraciju (jednokratno)

Init + tier su već primenjeni. Fali samo `payment_status` kolona.

## Opcija A — SQL Editor (najbrže, bez lozinke u .env)

1. Otvori [Supabase Dashboard](https://supabase.com/dashboard/project/tozyxkxmsyhyeznehjtx/sql/new)
2. Zalepi sadržaj fajla `supabase/migrations/20260616180000_add_payment.sql`
3. Klik **Run**

## Opcija B — Database password u .env.local

1. Supabase → **Project Settings** → **Database**
2. Sekcija **Database password** — ako ne znaš lozinku, klik **Reset database password** i sačuvaj novu
3. U `iznenadi/web/.env.local` dodaj:

```
SUPABASE_DB_PASSWORD=tvoja-lozinka-ovde
```

4. Pokreni:

```bash
cd iznenadi/web
npm run migrate
```

## Opcija C — Access Token (Management API)

1. [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) → Generate new token
2. U `.env.local`:

```
SUPABASE_ACCESS_TOKEN=sbp_...
```

3. `npm run migrate`

## Provera

Posle migracije:

```bash
npm run migrate
```

Treba da vidiš: `OK: kolone tier/payment_status` i `Nema migracija za primenu.`
