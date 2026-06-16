# Smoke test — produkcija

Odmah posle Vercel deploya. Zameni `BASE` sa tvojim URL-om.

## Statične rute

- [ ] `BASE/` — landing
- [ ] `BASE/templates` — 3 template kartice
- [ ] `BASE/demo` — LoveMessage demo
- [ ] `BASE/demo/quiz` — SecretQuiz demo
- [ ] `BASE/demo/phone` — UnlockPhone demo

## Wizard (beta besplatno)

- [ ] `BASE/create?template=love_message&tier=basic` — objava → `/create/done`
- [ ] `BASE/create?template=love_message&tier=standard` — custom boje + lightbox
- [ ] `BASE/create?template=secret_quiz&tier=premium` — kviz flow
- [ ] `BASE/create?template=unlock_phone&tier=premium` — notifikacije

Za svaki:
- [ ] Upload 1–3 realnih slika
- [ ] Share link na done stranici koristi `BASE` (ne localhost)
- [ ] QR kod skeniranje na telefonu otvara iskustvo
- [ ] WhatsApp dugme u share panelu

## Objavljeni link

- [ ] `BASE/s/<slug>` — template se učitava
- [ ] Slike se prikazuju (Supabase Storage URL)
- [ ] Pogrešan slug → 404

## Mobilni (bar jedan uređaj)

- [ ] Demo ili objavljeni link na telefonu
- [ ] Tap/swipe interakcije rade

## Rezultat

Sve checked → nastavi na [QA_CHECKLIST.md](QA_CHECKLIST.md)
