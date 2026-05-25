import { z } from "zod"
import { getHttpMpp } from "@/lib/mpp"
import { PRICE_USD, addressSchema, createMailing, isS3Url } from "@/lib/print-mail"

// Machine Payments Protocol (MPP) endpoint for agents.
//
// First request (no Authorization: Payment header) -> 402 with a
// WWW-Authenticate challenge. The agent pays and retries with the credential;
// once verified the document is printed and mailed and a Payment-Receipt
// header is attached.

const bodySchema = z.object({
  fileUrl: z.string().url(),
  mailType: z.enum(["standard", "premium"]).default("standard"),
  address: addressSchema,
})

export async function POST(request: Request) {
  // Read the body once: MPP binds it into the challenge digest, and we also
  // need it to fulfill the order after payment is verified.
  const bodyText = await request.text()

  const parsed = bodySchema.safeParse(safeJsonParse(bodyText))
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
  if (!isS3Url(parsed.data.fileUrl)) {
    return Response.json({ error: "File URL must be an S3 URL" }, { status: 400 })
  }

  // Re-attach the body so MPP can compute/verify its digest.
  const paymentRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: bodyText,
  })

  const result = await getHttpMpp().charge({
    amount: PRICE_USD,
    description: `Print & mail document to ${parsed.data.address.name}`,
    metadata: { service: "print-mail", mailType: parsed.data.mailType },
  })(paymentRequest)

  if (result.status === 402) {
    return result.challenge
  }

  try {
    const mailing = await createMailing(parsed.data)
    return result.withReceipt(Response.json({ success: true, ...mailing }))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create mailing job"
    return Response.json({ error: message }, { status: 500 })
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
