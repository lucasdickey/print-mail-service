"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Home, FileText, Loader2 } from "lucide-react"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [orderId, setOrderId] = useState("Unknown")
  const [trackingId, setTrackingId] = useState("Unknown")
  const [error, setError] = useState<string | null>(null)

  // Check if this is a redirect from Stripe
  const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")
  const paymentIntentId = searchParams.get("payment_intent")
  const redirectStatus = searchParams.get("redirect_status")

  useEffect(() => {
    const processPayment = async () => {
      // If this is not a redirect from Stripe, just show the confirmation
      if (!paymentIntentClientSecret || !paymentIntentId) {
        setIsLoading(false)
        return
      }

      try {
        console.log("Processing payment confirmation")
        console.log("Payment intent ID:", paymentIntentId)
        console.log("Redirect status:", redirectStatus)

        if (redirectStatus === "succeeded") {
          // For demo purposes, we'll just set some mock values
          // In a real app, you would retrieve the order details from your database
          // based on the payment intent ID
          setOrderId(`order_${Date.now()}`)
          setTrackingId(`track_${Math.random().toString(36).substring(2, 10)}`)
        } else {
          setError("Payment was not successful. Please try again.")
        }
      } catch (error) {
        console.error("Error processing payment confirmation:", error)
        setError("An error occurred while processing your payment confirmation.")
      } finally {
        setIsLoading(false)
      }
    }

    processPayment()
  }, [paymentIntentClientSecret, paymentIntentId, redirectStatus])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container max-w-2xl py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">Processing Your Order</h1>
            <p className="text-gray-500">Please wait while we confirm your payment...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container max-w-2xl py-12">
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 text-center">
              <div className="h-16 w-16 mx-auto text-red-500 mb-4">❌</div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Failed</h1>
              <p className="text-gray-500 mb-6">{error}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    Return Home
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-2xl py-12">
        <Card className="border-green-200 dark:border-green-900">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-6">
              Your document has been sent to our printing facility and will be mailed shortly.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium">{orderId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tracking ID</p>
                  <p className="font-medium">{trackingId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-500">
                You will receive an email with your order details and tracking information.
              </p>
              <p className="text-sm text-gray-500">Expected delivery: 3-5 business days</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </Link>
              <Link href="/upload">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Send Another Document
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

