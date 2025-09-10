# Internship Assignment – PDF Viewer + Data Extraction Dashboard

This repository contains a monorepo implementation of a PDF Review Dashboard with AI-powered invoice data extraction, CRUD, and a modern UI. It follows the given assessment requirements and is deployed on Vercel.

## Deployments
- Web (Next.js): <your web vercel url>
- API (Express): <your api vercel url>

## Monorepo Structure
- `apps/web`: Next.js (App Router) + TypeScript + shadcn/ui
- `apps/api`: Node.js (TypeScript) + Express + MongoDB (GridFS for files)
- `packages/types` (optional): shared TypeScript types

## Core Features
1) PDF Viewer
- Upload local PDFs (≤25 MB)
- In-browser rendering via pdf.js
- Zoom controls, page navigation, keyboard shortcuts
- Files stored in MongoDB GridFS

2) AI Data Extraction
- Button: "Extract with AI" (Gemini)
- Extracts structured invoice data and hydrates the form on the right

3) Data Editing & CRUD
- Edit any extracted field; line items add/remove
- Save creates/updates invoice records in MongoDB
- Delete removes invoice records
- List page with table and search (`vendor.name`, `invoice.number`)

4) Separation of Concerns
- `apps/web` makes REST calls to `apps/api`

## One-Command Setup
```
npm install
```

> The project is already deployed on Vercel; no local setup is required to review.

## API Documentation
See DOCS.md for full REST API details and the minimal data shape.

## UI Highlights
- Split layout: Left = PDF viewer, Right = editable form
- Resizer: Used to resize the split layout ratio
- Buttons: Extract, Save, Delete
- Toast notifications (color-coded), top-right position
- Table with icons in header, wider Vendor column, debounced search