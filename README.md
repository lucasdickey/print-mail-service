# Print Mail Service

A web application that lets users upload a PDF, pay for it, and have it printed and
mailed to a physical address via the [Lob](https://www.lob.com/) API.

## Features

- **PDF upload** to AWS S3
- **Payment processing** with Stripe
- **Physical mail delivery** through Lob
- **Agent access** via the [Machine Payments Protocol](https://docs.stripe.com/payments/machine/mpp) (MPP) — an AI agent can place a paid order over HTTP with payment enforced by Stripe
- **Modern UI** built with Next.js (App Router), React, and Tailwind CSS

## How it works

The app is a single-page wizard (`/`) with four steps:

1. **Upload** — the PDF is sent to `POST /api/upload` and stored in S3 (`pdfs/` prefix).
2. **Address** — the user enters a US mailing address.
3. **Payment** — a Stripe PaymentIntent is created (`POST /api/create-payment-intent`)
   and confirmed client-side with Stripe Elements.
4. **Confirmation** — once payment succeeds, `POST /api/send-mail` verifies the
   payment with Stripe and creates a Lob letter.

## Agent access (Machine Payments Protocol)

In addition to the interactive wizard, an autonomous agent can place a paid order
machine-to-machine through `POST /api/agent/mail`, with payment enforced by Stripe's
[Machine Payments Protocol](https://docs.stripe.com/payments/machine/mpp) (MPP).

The request body matches the wizard's order:

```json
{
  "fileUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/pdfs/123-doc.pdf",
  "mailType": "standard",
  "address": {
    "name": "Ada Lovelace",
    "address_line1": "1 Main St",
    "address_city": "San Francisco",
    "address_state": "CA",
    "address_zip": "94103",
    "address_country": "US"
  }
}
```

The flow:

1. The agent calls the endpoint. With no payment credential it receives
   **`402 Payment Required`** plus an MPP challenge (price is set server-side from
   `mailType`, so the caller can't pick its own amount).
2. The agent settles the challenge with a Shared Payment Token and retries.
3. MPP captures the payment through Stripe; the server then creates the Lob letter and
   returns the tracking details with a `Payment-Receipt` header.

The endpoint reuses the same Stripe and Lob clients as the rest of the app. It requires
`MPP_SECRET_KEY` and `MPP_NETWORK_ID` (see [Environment variables](#environment-variables));
without them the route fails loudly rather than skipping payment.

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

# MPP (agent endpoint) — settles through Stripe, so STRIPE_SECRET_KEY is also required
MPP_SECRET_KEY=...      # strong random value; binds 402 challenges to this server
MPP_NETWORK_ID=internal # Stripe network id used for MPP charges
MPP_REALM=              # optional; defaults to the deployment host
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
│   │   ├── agent/mail/              # Agent endpoint (MPP-gated order + Lob letter)
│   │   ├── create-payment-intent/   # Stripe PaymentIntent
│   │   ├── send-mail/               # Lob letter creation
│   │   └── upload/                  # PDF upload to S3
│   ├── orders/                      # Order history (demo data)
│   ├── payment-success/             # Stripe redirect target
│   ├── layout.tsx
│   └── page.tsx                     # Print & mail wizard
├── components/                      # UI + flow components
├── lib/                             # Stripe, Lob, S3, and MPP clients + pricing
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
