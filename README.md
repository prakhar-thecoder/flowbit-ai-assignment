# Flowbit AI Assignment

Monorepo with Next.js web app and Node/Express API.

## Apps
- `apps/web`: Next.js (App Router)
- `apps/api`: Node.js (TypeScript) + Express + MongoDB + GridFS

## Prerequisites
- Node 18+
- MongoDB Atlas URI
- Gemini API Key

## Environment
Create a `.env` at repo root.

Root `.env` (used by API at runtime and web for API base):
```
MONGODB_URI=
MONGODB_DB=flowbit
GEMINI_API_KEY=
PORT=4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## Install
```
npm install
```

## Develop
Run API and Web together:
```
npm run dev
```
- API: http://localhost:4000
- Web: http://localhost:3000

## API Routes
- POST `/upload` -> form-data `{ file }` => `{ fileId, fileName }`
- POST `/extract` -> `{ fileId, model: "gemini" }` => extracted JSON
- GET `/invoices?q=` -> list
- GET `/invoices/:id`
- POST `/invoices`
- PUT `/invoices/:id`
- DELETE `/invoices/:id`

## Notes
- PDF size limit 25MB
- Stored in MongoDB GridFS under bucket `pdfs`
- Extraction uses Gemini 1.5 Flash
