"use server"

import { revalidatePath } from "next/cache"
import Lob from "lob"
import Stripe from "stripe"

// Lob API client
const lobApiKey = process.env.LOB_API_KEY || '';
export const lob = new (Lob as any)(lobApiKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Define types
export type MailingAddress = {
  name: string
  company?: string
  address_line1: string
  address_line2?: string
  address_city: string
  address_state: string
  address_zip: string
  address_country: string
}

export type OrderDetails = {
  fileUrl: string
  fileName: string
  fileSize: number
  address: MailingAddress
  mailType: "standard" | "premium"
  price: number
}

// Upload file using base64 encoding (fallback method)
export async function uploadFileBase64(formData: FormData) {
  try {
    console.log("Server - Starting base64 encoding process")
    const file = formData.get("file") as File

    if (!file) {
      console.log("Server - No file provided")
      return { error: "No file provided" }
    }

    console.log(`Server - File received: ${file.name}, size: ${file.size}, type: ${file.type}`)

    if (file.type !== "application/pdf") {
      console.log(`Server - Invalid file type: ${file.type}`)
      return { error: "Only PDF files are supported" }
    }

    // Convert file to base64
    console.log("Server - Converting file to base64")
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log(`Server - Base64 encoding successful, data URL length: ${dataUrl.length}`)

    return {
      success: true,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
    }
  } catch (error) {
    console.error("Server - Upload error:", error)
    return { error: "Failed to process file" }
  }
}

// Create payment intent with Stripe
export async function createPaymentIntent(amount: number) {
  try {
    console.log("Creating payment intent for amount:", amount)

    // Convert to cents and ensure it's an integer
    const amountInCents = Math.round(amount * 100)
    console.log("Amount in cents:", amountInCents)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      // Add metadata if needed
      metadata: {
        integration_check: "accept_a_payment",
      },
    })

    console.log("Payment intent created:", paymentIntent.id)

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to create payment intent",
      details: error,
    }
  }
}

// Create a mailing job with Lob
export async function createMailingJob(orderDetails: OrderDetails) {
  try {
    const { fileUrl, address, mailType } = orderDetails

    // Check if the URL is a base64 data URL
    const isBase64 = fileUrl.startsWith("data:")
    console.log(`Mailing job - Using ${isBase64 ? "base64 data" : "URL"} for the file`)
    console.log(`Mailing job - File URL starts with: ${fileUrl.substring(0, 30)}...`)

    // Create a letter with Lob.com
    console.log("Mailing job - Creating letter with Lob")
    const letter = await lob.letters.create({
      description: `Letter for ${address.name}`,
      to: {
        name: address.name,
        company: address.company,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        address_city: address.address_city,
        address_state: address.address_state,
        address_zip: address.address_zip,
        address_country: address.address_country,
      },
      from: {
        name: "PrintMail Service",
        address_line1: "123 Main St",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94103",
        address_country: "US",
      },
      // If it's base64, use the data directly, otherwise use the URL
      file: fileUrl,
      color: mailType === "premium",
      double_sided: true,
      address_placement: "insert_blank_page",
      mail_type: mailType === "premium" ? "usps_first_class" : "standard",
    })

    console.log("Mailing job - Letter created successfully:", letter.id)

    return {
      success: true,
      trackingId: letter.id,
      expectedDeliveryDate: letter.expected_delivery_date,
    }
  } catch (error) {
    console.error("Error creating mailing job:", error)
    return { error: error instanceof Error ? error.message : "Failed to create mailing job" }
  }
}

// Save order to database (in a real app, you'd use a database)
export async function saveOrder(orderDetails: OrderDetails, trackingId: string) {
  // In a real app, you would save this to a database

  // Revalidate the orders page
  revalidatePath("/orders")

  return {
    success: true,
    orderId: `order_${Date.now()}`,
    trackingId,
    orderDetails,
  }
}

export async function uploadFile(formData: FormData) {
  console.error("uploadFile is not implemented in lib/actions.ts.  It should be using S3.")
  return { error: "uploadFile is not implemented.  It should be using S3." }
}
