import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the actual API key
const stripe = new Stripe("zSAPq8mXbsRpedFX2nfUy7XrBYN8Hxke", {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { amount, metadata } = await request.json()

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Error creating payment intent" }, { status: 500 })
  }
}
