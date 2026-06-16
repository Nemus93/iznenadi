# Beta sign-off

Potvrdi ručno pre uključivanja plaćanja (`STRIPE_PAYMENTS_ENABLED=true`) i GTM-a.

## Kriterijumi (sve mora biti DA)

- [ ] Smoke test ([SMOKE_TEST.md](SMOKE_TEST.md)) — sve prošlo
- [ ] QA matrica ([QA_CHECKLIST.md](QA_CHECKLIST.md)) — bez kritičnih bugova
- [ ] 3 template-i rade na **produkciji** sa realnim uploadom slika
- [ ] Share link otvara iskustvo na **telefonu** primaoca
- [ ] Barem 1 end-to-end test sa pravim sadržajem (ne placeholder tekst)

## Tvoja potvrda

| Polje | Vrednost |
|-------|----------|
| Datum | |
| Vercel URL | |
| Testirao | Nemanja |
| Spremno za napolje (beta) | DA / NE |
| Napomene | |

## Posle sign-off-a

1. Opciono: nastavi beta besplatno dok skupljaš feedback
2. Kad želiš naplatu: [STRIPE_TEST.md](STRIPE_TEST.md) → `STRIPE_PAYMENTS_ENABLED=true`
3. Kad plaćanje radi: [GTM.md](GTM.md)
