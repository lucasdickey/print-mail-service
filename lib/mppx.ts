import { Mppx, stripe } from "mppx/server"
import { getStripe } from "@/lib/stripe"

// Lazily-built MPP (Machine Payments Protocol) payment handler.
//
// MPP lets an autonomous agent pay for a resource over plain HTTP: the server
// answers an unpaid request with `402 Payment Required` and a challenge, the
// agent settles it via a Shared Payment Token, retries, and receives the
// resource plus a `Payment-Receipt`. We settle through Stripe, reusing the
// same Stripe client the rest of the app uses.
//
// Like the other service clients in lib/, this fails loudly when it is not
// configured rather than silently degrading.
let mppx: ReturnType<typeof createMppx> | null = null

function createMppx() {
  const secretKey = process.env.MPP_SECRET_KEY
  if (!secretKey) {
    throw new Error("MPP_SECRET_KEY is not set")
  }

  const networkId = process.env.MPP_NETWORK_ID
  if (!networkId) {
    throw new Error("MPP_NETWORK_ID is not set")
  }

  return Mppx.create({
    methods: [
      stripe.charge({
        client: getStripe(),
        networkId,
        currency: "usd",
        decimals: 2,
        paymentMethodTypes: ["card"],
      }),
    ],
    // Falls back to MPP_REALM / VERCEL_URL / request hostname when omitted.
    realm: process.env.MPP_REALM,
    secretKey,
  })
}

export function getMppx() {
  if (!mppx) {
    mppx = createMppx()
  }
  return mppx
}
