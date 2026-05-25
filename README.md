# Print Mail Service

A web application that lets users upload a PDF, pay for it, and have it printed and
mailed to a physical address via the [Lob](https://www.lob.com/) API.

## Features

- **PDF upload** to AWS S3
- **Payment processing** with Stripe
- **Physical mail delivery** through Lob
- **Modern UI** built with Next.js (App Router), React, and Tailwind CSS

## How it works

The app is a single-page wizard (`/`) with four steps:

1. **Upload** — the PDF is sent to `POST /api/upload` and stored in S3 (`pdfs/` prefix).
2. **Address** — the user enters a US mailing address.
3. **Payment** — a Stripe PaymentIntent is created (`POST /api/create-payment-intent`)
   and confirmed client-side with Stripe Elements.
4. **Confirmation** — once payment succeeds, `POST /api/send-mail` verifies the
   payment with Stripe and creates a Lob letter.

## Prerequisites

- Node.js 20.9.0 (see `.nvmrc`)
- An AWS account with an S3 bucket
- A Stripe account
- A Lob account

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Lob
LOB_API_KEY=...
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Production build (runs TS + ESLint)  |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | Run ESLint                           |
| `npm run typecheck` | Type-check with `tsc --noEmit`       |
| `npm run mcp`       | Start the stdio MCP server           |

## Machine access (Machine Payments Protocol)

In addition to the browser wizard, agents can use the service without a browser
via [Stripe's Machine Payments Protocol (MPP)](https://docs.stripe.com/payments/machine/mpp),
implemented with the [`mppx`](https://www.npmjs.com/package/mppx) SDK. Both
surfaces below charge the same price and settle through Stripe.

Set `MPP_SECRET_KEY` (see `.env.example`) in addition to the Stripe/Lob/S3 vars.

### HTTP endpoint

`POST /api/agent/print-mail` is gated by MPP:

1. The agent POSTs `{ fileUrl, mailType?, address }` (the PDF must already be at
   a public S3 URL — agents can upload one via `POST /api/upload`).
2. With no payment, the server responds **`402 Payment Required`** with a
   `WWW-Authenticate: Payment` challenge.
3. The agent pays and retries with an `Authorization: Payment <credential>`
   header. Once verified, the document is mailed and the response carries a
   `Payment-Receipt` header.

An MPP-aware client (e.g. `mppx/client`) handles steps 2–3 automatically.

### MCP server

`npm run mcp` starts a stdio [MCP](https://modelcontextprotocol.io) server
exposing two tools:

- `get_pricing` — free; returns the price.
- `print_and_mail` — payment-gated. An unpaid call returns a JSON-RPC error
  (code `-32042`) carrying the payment challenge; the agent's MPP-aware MCP
  client pays and retries with the credential in the request `_meta`.

Example MCP client config:

```json
{
  "mcpServers": {
    "print-mail": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/print-mail-service"
    }
  }
}
```

## S3 bucket policy

Lob fetches the uploaded PDF over HTTP, so objects under the `pdfs/` prefix must be
publicly readable:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForLob",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/pdfs/*"
    }
  ]
}
```

## Project structure

```
print-mail-service/
├── app/
│   ├── api/
│   │   ├── agent/print-mail/        # MPP-gated agent endpoint (402)
│   │   ├── create-payment-intent/   # Stripe PaymentIntent
│   │   ├── send-mail/               # Lob letter creation
│   │   └── upload/                  # PDF upload to S3
│   ├── orders/                      # Order history (demo data)
│   ├── payment-success/             # Stripe redirect target
│   ├── layout.tsx
│   └── page.tsx                     # Print & mail wizard
├── components/                      # UI + flow components
├── lib/                             # Stripe, Lob, S3, MPP clients + shared logic
├── mcp/                             # Stdio MCP server
├── types/                           # Type declarations
└── public/                          # Static assets
```

## Tech stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Storage**: AWS S3
- **Payments**: Stripe
- **Mail**: Lob
- **Deployment**: Vercel

## License

MIT
