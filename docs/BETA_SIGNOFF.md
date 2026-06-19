# Beta sign-off

Potvrdi ručno pre uključivanja plaćanja (`STRIPE_PAYMENTS_ENABLED=true`) i GTM-a.

## Kriterijumi (sve mora biti DA)

- [x] Smoke test automatski (`npm run smoke https://web-beta-umber-59.vercel.app`) — 10/10 ruta
- [ ] Smoke test ručno na telefonu (upload, QR, WhatsApp) — vidi ispod
- [ ] QA matrica ([QA_CHECKLIST.md](QA_CHECKLIST.md)) — bez kritičnih bugova
- [ ] 3 template-i rade na **produkciji** sa realnim uploadom slika
- [ ] Share link otvara iskustvo na **telefonu** primaoca
- [ ] Barem 1 end-to-end test sa pravim sadržajem (ne placeholder tekst)

## Tvoja potvrda

| Polje | Vrednost |
|-------|----------|
| Datum | |
| Vercel URL | https://web-beta-umber-59.vercel.app |
| Testirao | Nemanja |
| Spremno za napolje (beta) | DA / NE |
| Napomene | |

## Posle sign-off-a

1. Opciono: nastavi beta besplatno dok skupljaš feedback
2. Kad želiš naplatu: [STRIPE_TEST.md](STRIPE_TEST.md) → `STRIPE_PAYMENTS_ENABLED=true`
3. Kad plaćanje radi: [GTM.md](GTM.md)
