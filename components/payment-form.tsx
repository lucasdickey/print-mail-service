"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import type { OrderData } from "./print-mail-wizard"
import { useToast } from "@/hooks/use-toast"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createPaymentIntent, createMailingJob, saveOrder } from "@/lib/actions"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

type PaymentFormProps = {
  orderData: OrderData
  onComplete: (paymentData: Partial<OrderData>) => void
  onBack: () => void
}

export function PaymentForm({ orderData, onComplete, onBack }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Calculate price - in a real app, this would be more sophisticated
  const price = 5.99

  // Create payment intent when component mounts
  useEffect(() => {
    const initPayment = async () => {
      setIsLoading(true)
      try {
        const result = await createPaymentIntent(price)

        if (result.error) {
          toast({
            title: "Payment Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        setClientSecret(result.clientSecret || null)
      } catch (error) {
        console.error("Error creating payment intent:", error)
        toast({
          title: "Payment Error",
          description: "There was an error setting up the payment. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initPayment()
  }, [price, toast])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Payment</h2>
        <p className="text-gray-500 dark:text-gray-400">Complete your payment to send your document</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Document Printing</span>
              <span>$2.99</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Handling</span>
              <span>$3.00</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>${price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <CheckoutForm price={price} orderData={orderData} onComplete={onComplete} onBack={onBack} />
          </Elements>
        ) : (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Card>
    </div>
  )
}

function CheckoutForm({
  price,
  orderData,
  onComplete,
  onBack,
}: {
  price: number
  orderData: OrderData
  onComplete: (paymentData: Partial<OrderData>) => void
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Process payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-success",
        },
        redirect: "if_required",
      })

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        })
        return
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Payment successful",
          description: "Your document will be printed and mailed shortly",
        })

        // Prepare order details for Lob
        const orderDetails = {
          fileUrl: orderData.fileUrl || "",
          fileName: orderData.file?.name || "document.pdf",
          fileSize: orderData.file?.size || 0,
          address: {
            name: orderData.address?.name || "",
            address_line1: orderData.address?.line1 || "",
            address_line2: orderData.address?.line2,
            address_city: orderData.address?.city || "",
            address_state: orderData.address?.state || "",
            address_zip: orderData.address?.zip || "",
            address_country: orderData.address?.country || "US",
          },
          mailType: "standard" as const,
          price: price,
        }

        // Create mailing job with Lob
        const mailingResult = await createMailingJob(orderDetails)

        if (mailingResult.error) {
          throw new Error(mailingResult.error)
        }

        // Save order
        const orderResult = await saveOrder(orderDetails, mailingResult.trackingId!)

        // Complete the process
        onComplete({
          price,
          orderId: paymentIntent.id,
          trackingId: mailingResult.trackingId,
          expectedDelivery: mailingResult.expectedDeliveryDate,
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Error",
        description: "There was an error processing your payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${price.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

