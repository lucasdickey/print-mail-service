"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { File, Loader2 } from "lucide-react"
import { createPaymentIntent, type MailingAddress, type OrderDetails } from "@/lib/actions"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { SimpleCheckoutForm } from "@/components/simple-checkout-form"

// Make sure to use the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Extract all the data from URL params
  const fileUrl = searchParams.get("fileUrl") || ""
  const fileName = searchParams.get("fileName") || ""
  const fileSize = Number.parseInt(searchParams.get("fileSize") || "0")
  const mailType = (searchParams.get("type") || "standard") as "standard" | "premium"

  const address: MailingAddress = {
    name: searchParams.get("name") || "",
    company: searchParams.get("company") || undefined,
    address_line1: searchParams.get("address_line1") || "",
    address_line2: searchParams.get("address_line2") || undefined,
    address_city: searchParams.get("address_city") || "",
    address_state: searchParams.get("address_state") || "",
    address_zip: searchParams.get("address_zip") || "",
    address_country: searchParams.get("address_country") || "US",
  }

  // Calculate price based on mail type
  const basePrice = mailType === "premium" ? 4.99 : 2.99

  // Create payment intent on component mount
  useEffect(() => {
    const initializePayment = async () => {
      try {
        console.log("Creating payment intent for amount:", basePrice)
        const result = await createPaymentIntent(basePrice)

        if (result.error) {
          console.error("Payment intent creation failed:", result.error, result.details)
          toast({
            title: "Payment initialization failed",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        if (!result.clientSecret) {
          throw new Error("No client secret received")
        }

        console.log("Payment intent created successfully")
        setClientSecret(result.clientSecret)
      } catch (error) {
        console.error("Error initializing payment:", error)
        toast({
          title: "Payment initialization failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    initializePayment()
  }, [basePrice, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2">Initializing payment...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl py-12">
          <div className="text-center">
            <p className="text-red-500">Failed to initialize payment. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const orderDetails: OrderDetails = {
    fileUrl,
    fileName,
    fileSize,
    address,
    mailType,
    price: basePrice,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-gray-500 mt-2">Complete your payment to send your document.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                    },
                  }}
                >
                  <SimpleCheckoutForm orderDetails={orderDetails} onBack={() => router.back()} />
                </Elements>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <File className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{fileName}</p>
                      <p className="text-xs text-gray-500">{(fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{mailType === "premium" ? "Premium Mail" : "Standard Mail"}</span>
                      <span className="font-bold">${basePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{address.name}</p>
                      {address.company && <p>{address.company}</p>}
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>
                        {address.address_city}, {address.address_state} {address.address_zip}
                      </p>
                      <p>{address.address_country}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>${basePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

