# Iznenadi

Personalizovana digitalna iznenađenja — romantični template-i, wizard, share link za telefon.

## Rute

| Ruta | Opis |
|------|------|
| `/` | Landing |
| `/templates` | Katalog template-a i tier-ova |
| `/create?template=...&tier=...` | Wizard |
| `/demo`, `/demo/quiz`, `/demo/phone` | Demo iskustva |
| `/s/[slug]` | Objavljeno iznenađenje |

## Lokalno

```bash
cp .env.example .env.local
# Popuni Supabase keys (vidi docs/SUPABASE_SETUP.md)

npm ci
npm run dev
```

## Supabase migracije

Pokreni redom u SQL Editoru:

1. `supabase/migrations/20260615160000_init_surprises.sql`
2. `supabase/migrations/20260615170000_add_tier.sql`
3. `supabase/migrations/20260616180000_add_payment.sql`

Detalji: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

## Deploy (Vercel)

1. Poseban GitHub repo — vidi `scripts/prepare-standalone-repo.ps1`
2. Import u Vercel, root = repo root
3. Env vars iz `.env.example`
4. `NEXT_PUBLIC_APP_URL` = `https://tvoj-projekat.vercel.app`

Detalji: [docs/DEPLOY.md](docs/DEPLOY.md)

## Beta vs plaćanje

- **Beta (default):** `STRIPE_PAYMENTS_ENABLED=false` — svi tier-ovi besplatni, odmah publish.
- **Plaćanje:** `STRIPE_PAYMENTS_ENABLED=true` + Stripe env — Standard/Premium idu na Checkout pre objave.

Test: [docs/STRIPE_TEST.md](docs/STRIPE_TEST.md)

## QA i launch

- Smoke test: [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md)
- QA matrica: [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md)
- Beta sign-off: [docs/BETA_SIGNOFF.md](docs/BETA_SIGNOFF.md)
- GTM (posle sign-off-a): [docs/GTM.md](docs/GTM.md)

## Faze

| Faza | Status |
|------|--------|
| 3A — Katalog, teme, lightbox | Done |
| 3B — SecretQuiz | Done |
| 3C — UnlockPhone | Done |
| 3D — Stripe (kod spreman, beta off) | Done |
| 4 — GTM | Plan u docs/GTM.md |

## Stack

Next.js 16 · Tailwind v4 · Framer Motion · Supabase · Stripe · Vercel
