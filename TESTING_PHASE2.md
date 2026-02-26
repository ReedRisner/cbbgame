# Phase 2 Testing (Windows + macOS/Linux)

## 1) Fresh install (fixes missing nested package errors)

If `npm test` fails with an error like:

- `Cannot find package ... node_modules\\vite-node\\node_modules\\debug\\index.js`

do a clean reinstall:

```powershell
# from repo root
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

Then run:

```powershell
npm test
```

If your shell cannot execute the `vitest` shim, run the node entry directly:

```powershell
npm run test:node
```

## 2) Prisma

```powershell
npx prisma generate
npx prisma migrate dev --name phase2_backend
```

> Make sure Postgres is running and `DATABASE_URL` is valid in `.env`.

## 3) Verification script

Use `.ts` (not `.tsn`):

```powershell
npm run verify:phase2
```

Equivalent direct command:

```powershell
node -r ts-node/register src/verifyPhase2.ts
```

## 4) API smoke checks

```powershell
npm run api
```

In another shell:

```powershell
curl -X POST http://localhost:4000/api/recruiting/advance-week -H "Content-Type: application/json" -d '{"season":1,"week":1}'
curl http://localhost:4000/api/recruiting/board/1?season=1
curl http://localhost:4000/api/nil/budget/1
```
