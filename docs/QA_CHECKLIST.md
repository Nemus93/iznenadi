# QA matrica — pre Stripe sign-off-a

## Uređaji

| Uređaj | OS | Browser | Status |
|--------|-----|---------|--------|
| iPhone (SE ili stariji) | iOS | Safari | |
| Android mid-range | Android | Chrome | |
| Desktop | Win/Mac | Chrome | |

## LoveMessage

| Tier | Scena flow | Lightbox | Custom boje |
|------|------------|----------|-------------|
| Basic | Intro → Reasons → Photos → Message → Finale | — | preset only |
| Standard | isto | tap slika | custom opcija |

## SecretQuiz

- [ ] Intro → kviz (tačan/pogrešan odgovor, max 3 pokušaja)
- [ ] Photos → Message → Finale

## UnlockPhone

- [ ] Intro → lock screen → notifikacije jedna po jedna
- [ ] Notifikacija sa slikom
- [ ] Unlock animacija → poruka → finale

## Edge slučaji

- [ ] 5 slika (Standard/Premium max)
- [ ] Velike slike (kompresija, progress „Kompresija slika...")
- [ ] Prazan/pogrešan slug → 404
- [ ] Preview modal u wizardu pre objave

## Produkcija specifično

- [ ] Upload na Vercel (ne samo lokalno)
- [ ] Share URL = Vercel domen
- [ ] OG meta na `/s/[slug]` (title sa imenom primaoca)

## Bug log

| # | Opis | Severity | Fixed |
|---|------|----------|-------|
| 1 | | | |

Kritični bugovi (blokiraju slanje linka primaocu) moraju biti fixed pre [BETA_SIGNOFF.md](BETA_SIGNOFF.md).
