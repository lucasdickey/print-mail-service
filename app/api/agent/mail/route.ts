import { NextResponse } from "next/server"
import { z } from "zod"
import { getLob } from "@/lib/lob"
import { getMppx } from "@/lib/mppx"
import { priceFor } from "@/lib/pricing"

// MPP performs an HMAC verification and talks to Stripe, so this must run on
// the Node.js runtime rather than the edge.
export const runtime = "nodejs"

const addressSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  address_city: z.string().min(1),
  address_state: z.string().min(1),
  address_zip: z.string().min(1),
  address_country: z.string().min(1),
})

const schema = z.object({
  fileUrl: z.string().url(),
  mailType: z.enum(["standard", "premium"]).default("standard"),
  address: addressSchema,
})

// Agent-facing endpoint: an agent POSTs a print-mail order and payment is
// enforced via the Machine Payments Protocol. The first call returns a 402
// challenge; once the agent settles and retries with a valid credential, the
// payment is captured through Stripe and the letter is created with Lob.
export async function POST(request: Request) {
  // Parse from a clone so the original request stream stays intact for the
  // payment layer (which reads the credential from the request headers).
  const parsed = schema.safeParse(await request.clone().json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const order = parsed.data

  // Lob fetches the document over HTTP, so it must be hosted on S3. Validate
  // before charging so we never take a payment we can't fulfill.
  if (!order.fileUrl.includes("amazonaws.com")) {
    return NextResponse.json({ error: "File URL must be an S3 URL" }, { status: 400 })
  }

  // Price is derived server-side (in cents) so the agent cannot dictate it.
  const amount = String(priceFor(order.mailType))

  const result = await getMppx().charge({
    amount,
    description: `PrintMail ${order.mailType} letter to ${order.address.name}`,
    metadata: { mailType: order.mailType },
  })(request)

  // Payment not yet settled — hand the agent the 402 challenge to pay against.
  if (result.status === 402) {
    return result.challenge
  }

  // Payment verified and captured. Create the letter and return the tracking
  // details with the payment receipt attached.
  try {
    const letter = await getLob().letters.create({
      description: `Letter for ${order.address.name}`,
      to: order.address,
      from: {
        name: "PrintMail Service",
        address_line1: "123 Main St",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94103",
        address_country: "US",
      },
      file: order.fileUrl,
      color: order.mailType === "premium",
      double_sided: true,
      address_placement: "insert_blank_page",
      mail_type: order.mailType === "premium" ? "usps_first_class" : "usps_standard",
      use_type: "operational",
    })

    return result.withReceipt(
      NextResponse.json({
        success: true,
        trackingId: letter.id,
        trackingNumber: letter.tracking_number,
        expectedDelivery: letter.expected_delivery_date,
      }),
    )
  } catch (error) {
    // The payment already settled; surface the failure with the receipt so the
    // charge can be reconciled or refunded out of band.
    const message = error instanceof Error ? error.message : "Failed to create mailing job"
    return result.withReceipt(NextResponse.json({ error: message }, { status: 500 }))
  }
}
