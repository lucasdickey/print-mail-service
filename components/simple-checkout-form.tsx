"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import type { OrderDetails } from "@/lib/actions"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

interface SimpleCheckoutFormProps {
  orderDetails: OrderDetails
  onBack: () => void
}

export function SimpleCheckoutForm({ orderDetails, onBack }: SimpleCheckoutFormProps) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.log("Stripe.js hasn't loaded yet")
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log("Starting payment process...")

      // Process payment with Stripe - use the simplest approach
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make the redirect always happen to simplify the flow
          return_url: `${window.location.origin}/confirmation?success=true`,
        },
        // Force redirect to simplify the flow
        redirect: "always",
      })

      // This code will only run if redirect is not immediate
      console.log("Payment result:", result)

      if (result.error) {
        console.error("Payment error:", result.error)
        setPaymentError(result.error.message || "Payment failed")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setPaymentError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{paymentError}</div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button type="submit" disabled={!stripe || !elements || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${orderDetails.price.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

