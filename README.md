# Binary Trading — Demo Full Site

## Quick start (dev)

1. Copy server/.env.example to server/.env and set `JWT_SECRET` (and BROKER_API_TOKEN if you have one).
2. From repo root run:

```bash
docker-compose up --build
```

3. Wait for server (4000) and client (3000) to start. Open http://localhost:3000

4. Register a user, go to Dashboard, and use the Trade widget. Prices come from broker sandbox ticks (if available).

## Notes
- This is a **development** demo. Replace the KYC stub, strengthen authentication, move secrets to vault, and get legal/regulatory clearance before any real-money usage.
- Use `npx prisma studio --schema=server/prisma/schema.prisma` to inspect the SQLite DB during development.
