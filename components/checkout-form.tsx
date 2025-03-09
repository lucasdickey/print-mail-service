"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import { createMailingJob, saveOrder, type OrderDetails } from "@/lib/actions"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

interface CheckoutFormProps {
  orderDetails: OrderDetails
}

export function CheckoutForm({ orderDetails }: CheckoutFormProps) {
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
      // First, validate that a payment method has been entered
      const { error: elementsError } = await elements.submit()
      if (elementsError) {
        console.error("Elements validation error:", elementsError)
        setPaymentError(elementsError.message || "Please check your payment details")
        setIsProcessing(false)
        return
      }

      console.log("Processing payment...")

      // Process payment with Stripe
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
          payment_method_data: {
            billing_details: {
              name: orderDetails.address.name,
              email: "", // Add email if available
              address: {
                line1: orderDetails.address.address_line1,
                line2: orderDetails.address.address_line2,
                city: orderDetails.address.address_city,
                state: orderDetails.address.address_state,
                postal_code: orderDetails.address.address_zip,
                country: orderDetails.address.address_country,
              },
            },
          },
        },
        redirect: "if_required",
      })

      if (paymentError) {
        console.error("Payment error:", paymentError)
        setPaymentError(paymentError.message || "Payment failed")
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded, creating mailing job...")

        // Create mailing job with Lob
        const mailingResult = await createMailingJob(orderDetails)

        if (mailingResult.error) {
          console.error("Mailing job error:", mailingResult.error)
          toast({
            title: "Mailing job creation failed",
            description: mailingResult.error,
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }

        console.log("Mailing job created, saving order...")

        // Save order details
        const orderResult = await saveOrder(orderDetails, mailingResult.trackingId!)

        if (orderResult.success) {
          console.log("Order saved, redirecting to confirmation...")
          // Navigate to confirmation page
          router.push(`/confirmation?orderId=${orderResult.orderId}&trackingId=${mailingResult.trackingId}`)
        } else {
          console.error("Order save failed")
          toast({
            title: "Order processing failed",
            description: "Your payment was successful, but we had trouble processing your order",
            variant: "destructive",
          })
          setIsProcessing(false)
        }
      } else {
        console.error("Payment not succeeded:", paymentIntent?.status)
        setPaymentError("Payment processing failed. Please try again.")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setPaymentError("An unexpected error occurred")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{paymentError}</div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isProcessing}>
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

