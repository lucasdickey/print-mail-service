import { discovery } from "mppx/nextjs"
import { getMppx } from "@/lib/mppx"
import { priceCents } from "@/lib/pricing"

// getMppx() reads env and Stripe, so this must run on the Node.js runtime.
export const runtime = "nodejs"

// Serves an OpenAPI 3.1 discovery document so an agent can find the paid
// print-mail endpoint and learn how to pay for it over MPP. getMppx() is
// called per-request (not at module load) so a missing-config deployment
// fails at request time rather than at build time.
export async function GET(request: Request): Promise<Response> {
  return discovery(getMppx(), {
    info: { title: "PrintMail Agent API", version: "1.0.0" },
    routes: [
      {
        intent: "charge",
        method: "POST",
        path: "/api/agent/mail",
        // Representative price (standard), as canonical minor units (cents) to
        // match the on-the-wire challenge. The binding amount is always the one
        // returned in the live 402 challenge and depends on mailType.
        options: { amount: String(priceCents("standard")), currency: "usd" },
        summary:
          "Print and mail a PDF letter. Price is set server-side from mailType (standard or premium); the binding amount is returned in the 402 challenge.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fileUrl", "address"],
                properties: {
                  fileUrl: {
                    type: "string",
                    format: "uri",
                    description: "Public S3 URL of the PDF to print (amazonaws.com).",
                  },
                  mailType: {
                    type: "string",
                    enum: ["standard", "premium"],
                    default: "standard",
                  },
                  address: {
                    type: "object",
                    required: [
                      "name",
                      "address_line1",
                      "address_city",
                      "address_state",
                      "address_zip",
                      "address_country",
                    ],
                    properties: {
                      name: { type: "string" },
                      company: { type: "string" },
                      address_line1: { type: "string" },
                      address_line2: { type: "string" },
                      address_city: { type: "string" },
                      address_state: { type: "string" },
                      address_zip: { type: "string" },
                      address_country: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  })(request)
}
