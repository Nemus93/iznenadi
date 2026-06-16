# Stripe test — pre live keys

## Preduslov

- Beta sign-off ([BETA_SIGNOFF.md](BETA_SIGNOFF.md))
- Stripe account (test mode)
- Migracija `20260616180000_add_payment.sql` pokrenuta na prod Supabase

## Env vars (Vercel Preview ili Production test)

```
STRIPE_PAYMENTS_ENABLED=true
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STANDARD=price_...   # opciono
STRIPE_PRICE_PREMIUM=price_...    # opciono
```

Bez Price ID-a app koristi `price_data` fallback (RSD iz `lib/billing.ts`).

## Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Endpoint: `https://<app>.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `checkout.session.expired`
4. Kopiraj signing secret → `STRIPE_WEBHOOK_SECRET`

Za lokalni dev: Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Test checkout

| Tier | Očekivano |
|------|-----------|
| Basic | Besplatno, direktan publish (bez Checkout) |
| Standard | Redirect na Stripe → plaćanje → `/create/done` |
| Premium (quiz/phone) | isto |

Test kartica: `4242 4242 4242 4242`, bilo koji datum/CVC.

## Provera

- [ ] Draft u Supabase pre plaćanja (`status=draft`, `payment_status=pending`)
- [ ] Posle plaćanja: `status=published`, `payment_status=paid`
- [ ] `/s/[slug]` radi
- [ ] Cancel checkout → korisnik se vrati na wizard (`payment=cancelled`)

## Sign-off plaćanja

| Polje | Vrednost |
|-------|----------|
| Datum | |
| Test mode OK | DA / NE |
| Live keys uključene | DA / NE (samo kad spreman) |
| Napomene | |

## Live mode

1. Zameni `sk_test_` sa `sk_live_`
2. Live webhook secret
3. Live Price IDs ako koristiš
4. Jedan mali realan test pre javnog launch-a
