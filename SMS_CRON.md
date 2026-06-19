# SMS cron na Vercel Hobby

Vercel **Hobby** dozvoljava cron **najviše jednom dnevno** — `* * * * *` blokira deploy.

Za beta SMS drip koristi **spoljni scheduler** (besplatno):

1. Postavi `CRON_SECRET` na Vercel-u (već sync-ovano).
2. Na [cron-job.org](https://cron-job.org) ili slično: **GET** svakih 1–5 min:
   ```
   https://<tvoj-domen>/api/cron/send-notifications
   Authorization: Bearer <CRON_SECRET>
   ```
3. Ili n8n workflow (NAIS stack) sa istim endpoint-om.

Kad pređeš na Vercel Pro, vrati u `vercel.json`:

```json
"crons": [{ "path": "/api/cron/send-notifications", "schedule": "* * * * *" }]
```
