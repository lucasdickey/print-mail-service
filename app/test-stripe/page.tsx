"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createPaymentIntent } from "@/lib/actions"
import { Loader2 } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function TestStripePage() {
  const [amount, setAmount] = useState("2.99")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreatePaymentIntent = async () => {
    setLoading(true)
    setError(null)

    try {
      const amountValue = Number.parseFloat(amount)
      if (isNaN(amountValue) || amountValue <= 0) {
        setError("Please enter a valid amount")
        return
      }

      const result = await createPaymentIntent(amountValue)

      if (result.error) {
        setError(result.error)
        return
      }

      setClientSecret(result.clientSecret || null)
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Test Stripe Integration</h1>

        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle>Create Payment Intent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <Button onClick={handleCreatePaymentIntent} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Payment Intent"
                )}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {clientSecret && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Test Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                  },
                }}
              >
                <TestPaymentForm />
              </Elements>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TestPaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/test-stripe/success`,
        },
        redirect: "if_required",
      })

      if (result.error) {
        setError(result.error.message || "Payment failed")
      } else if (result.paymentIntent?.status === "succeeded") {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
          Payment successful!
        </div>
      )}

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  )
}

