import { NextResponse } from "next/server"
import { z } from "zod"
import { getLob } from "@/lib/lob"
import { getStripe } from "@/lib/stripe"

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

  // Lob fetches the document over HTTP, so it must be hosted on S3.
  if (!orderDetails.fileUrl.includes("amazonaws.com")) {
    return NextResponse.json({ error: "File URL must be an S3 URL" }, { status: 400 })
  }

  try {
    // Never mail a document unless the payment actually succeeded.
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment has not been completed" }, { status: 402 })
    }

    const letter = await getLob().letters.create({
      description: `Letter for ${orderDetails.address.name}`,
      to: orderDetails.address,
      from: {
        name: "PrintMail Service",
        address_line1: "123 Main St",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94103",
        address_country: "US",
      },
      file: orderDetails.fileUrl,
      color: orderDetails.mailType === "premium",
      double_sided: true,
      address_placement: "insert_blank_page",
      mail_type: orderDetails.mailType === "premium" ? "usps_first_class" : "usps_standard",
      use_type: "operational",
    })

    return NextResponse.json({
      success: true,
      trackingId: letter.id,
      trackingNumber: letter.tracking_number,
      expectedDelivery: letter.expected_delivery_date,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create mailing job"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
