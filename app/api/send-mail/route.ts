import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe"
import { addressSchema, createMailing, isS3Url } from "@/lib/print-mail"

const schema = z.object({
  paymentIntentId: z.string().min(1),
  orderDetails: z.object({
    fileUrl: z.string().url(),
    mailType: z.enum(["standard", "premium"]).default("standard"),
    address: addressSchema,
  }),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { paymentIntentId, orderDetails } = parsed.data

  if (!isS3Url(orderDetails.fileUrl)) {
    return NextResponse.json({ error: "File URL must be an S3 URL" }, { status: 400 })
  }

  try {
    // Never mail a document unless the payment actually succeeded.
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment has not been completed" }, { status: 402 })
    }

    const mailing = await createMailing(orderDetails)
    return NextResponse.json({ success: true, ...mailing })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create mailing job"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
