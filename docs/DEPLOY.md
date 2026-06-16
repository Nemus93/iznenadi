# Deploy na Vercel

## Preduslov

- GitHub repo (poseban za Iznenadi — vidi `scripts/prepare-standalone-repo.ps1`)
- Supabase prod podešen ([SUPABASE_SETUP.md](SUPABASE_SETUP.md))

## Koraci

### 1. GitHub repo

```powershell
cd iznenadi/web
.\scripts\prepare-standalone-repo.ps1
cd ..\..\iznenadi-app
git init
git add .
git commit -m "Initial Iznenadi app"
git branch -M main
git remote add origin https://github.com/Nemus93/iznenadi.git
git push -u origin main
```

(Zameni URL repoa ako je drugačiji.)

### 2. Vercel import

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Root Directory: **/** (repo root)
3. Framework: Next.js (auto)

### 3. Environment variables

Production + Preview:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://<ime-projekta>.vercel.app
STRIPE_PAYMENTS_ENABLED=false
```

Stripe vars ostaju prazne dok beta je besplatna.

**Važno:** Posle prvog deploya postavi `NEXT_PUBLIC_APP_URL` na stvarni Vercel URL i redeploy — share linkovi moraju voditi na produkciju.

### 4. Deploy

Deploy → otvori `https://<projekat>.vercel.app`

### 5. Smoke test

Vidi [SMOKE_TEST.md](SMOKE_TEST.md)

## Troubleshooting

| Problem | Rešenje |
|---------|---------|
| 404 na `/s/slug` | Proveri Supabase env vars i da je surprise `published` |
| Upload ne radi | Service role key; bucket `surprise-photos` postoji |
| Share link localhost | Ažuriraj `NEXT_PUBLIC_APP_URL` i redeploy |
| Build fail | `npm run build` lokalno, proveri log |
