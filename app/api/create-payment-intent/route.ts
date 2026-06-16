import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe"

const schema = z.object({
  amount: z.number().int().positive(),
  metadata: z.record(z.string(), z.string()).optional(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: parsed.data.amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: parsed.data.metadata,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment intent"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
