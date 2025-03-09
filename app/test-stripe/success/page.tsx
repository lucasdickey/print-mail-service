"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"

export default function TestStripeSuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  useEffect(() => {
    // Get payment_intent and payment_intent_client_secret from URL
    const paymentIntent = searchParams.get("payment_intent")
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")
    const redirectStatus = searchParams.get("redirect_status")

    console.log("Payment Intent:", paymentIntent)
    console.log("Redirect Status:", redirectStatus)

    setPaymentId(paymentIntent)
    setPaymentStatus(redirectStatus)
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2">Processing payment result...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              {paymentStatus === "succeeded" ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  Payment Successful
                </>
              ) : (
                "Payment Result"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Payment Status:</p>
                <p className={paymentStatus === "succeeded" ? "text-green-600" : "text-gray-600"}>
                  {paymentStatus || "Unknown"}
                </p>
              </div>

              {paymentId && (
                <div>
                  <p className="font-medium">Payment ID:</p>
                  <p className="text-gray-600 break-all">{paymentId}</p>
                </div>
              )}

              <div className="pt-4">
                <Link href="/test-stripe">
                  <Button className="w-full">Back to Test Page</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

