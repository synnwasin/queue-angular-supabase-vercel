# Queue Ticket System

Stack:

- Frontend: Angular
- Backend: Node.js + Express
- Database: Supabase PostgreSQL
- Deploy: Vercel

## Architecture

Browser
  -> Angular
  -> `/api/queue/next`
  -> Vercel Serverless Function
  -> Express
  -> Supabase RPC `next_ticket()`
  -> PostgreSQL

## Queue sequence

260 tickets:

A0 A1 ... A9
B0 B1 ... B9
...
Z0 Z1 ... Z9

Example:

A9 -> next = B0
Z9 -> next = A0

After reset:

00 -> next = A0

## Important concurrency protection

Do NOT calculate and update the ticket number in Angular.

The database function uses:

```sql
SELECT current_index
FROM queue_state
WHERE id = 1
FOR UPDATE;
```

The singleton row is locked inside the transaction. Concurrent calls wait for the current transaction to finish, then read the updated value. This prevents duplicate tickets.

## 1. Supabase

Open:

Supabase Dashboard -> SQL Editor

Run:

```text
supabase/schema.sql
```

## 2. Local development

Install:

```bash
npm install
```

Create `.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Run Angular:

```bash
npm start
```

For local Angular -> Vercel API integration, use Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Then open the URL shown by Vercel.

## 3. Vercel

Import this repository into Vercel.

Environment Variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Set them for the required environments.

The Angular build is:

```text
npm run build
```

Output:

```text
dist/it05-queue
```

The Express API is:

```text
api/index.js
```

### Security

`SUPABASE_SERVICE_ROLE_KEY` must ONLY exist in Vercel/server-side environment variables.

Never put it in Angular source code or `environment.ts`.

## API

GET `/api/queue`

POST `/api/queue/next`

POST `/api/queue/reset`

## UI

IT 05-1:
- รับบัตรคิว
- ล้างคิว

IT 05-2:
- แสดงหมายเลขคิว
- วันเวลา
- กลับหน้ารับบัตรคิว

IT 05-3:
- ล้างคิว
- แสดง 00
- กลับหน้ารับบัตรคิว
