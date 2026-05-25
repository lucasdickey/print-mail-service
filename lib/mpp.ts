import { Mppx, stripe, Transport } from "mppx/server"
import { getStripe } from "./stripe"

// Stripe "charge" method for MPP, settled via Shared Payment Tokens (SPTs).
// `networkId: "internal"` settles directly on this Stripe account.
function stripeMethod() {
  return stripe({
    client: getStripe(),
    networkId: "internal",
    currency: "usd",
    decimals: 2,
    paymentMethodTypes: ["card"],
  })
}

// HMAC secret that binds MPP challenges to their contents so the server can
// statelessly verify that an incoming credential matches a challenge it issued.
function secretKey() {
  const key = process.env.MPP_SECRET_KEY
  if (!key) {
    throw new Error("MPP_SECRET_KEY is not set")
  }
  return key
}

// Stable realm for payment challenges (defaults work for HTTP via the request
// host, but the MCP transport has no request URL to infer one from).
function realm() {
  return process.env.MPP_REALM ?? "print-mail-service"
}

function createHttpMpp() {
  return Mppx.create({ methods: [stripeMethod()], secretKey: secretKey(), realm: realm() })
}

function createMcpMpp() {
  return Mppx.create({
    methods: [stripeMethod()],
    secretKey: secretKey(),
    realm: realm(),
    transport: Transport.mcpSdk(),
  })
}

let httpMpp: ReturnType<typeof createHttpMpp> | null = null
let mcpMpp: ReturnType<typeof createMcpMpp> | null = null

// HTTP transport: 402 + WWW-Authenticate challenge, Authorization: Payment
// credential, Payment-Receipt on success.
export function getHttpMpp() {
  if (!httpMpp) {
    httpMpp = createHttpMpp()
  }
  return httpMpp
}

// MCP transport: challenges as JSON-RPC error -32042, credential/receipt via
// the "org.paymentauth/*" tool _meta keys.
export function getMcpMpp() {
  if (!mcpMpp) {
    mcpMpp = createMcpMpp()
  }
  return mcpMpp
}
