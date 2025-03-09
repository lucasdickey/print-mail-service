"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would verify the payment status here
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
              <p className="text-gray-500 dark:text-gray-400">Please wait while we confirm your payment...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Your document has been sent to our printing facility
              </p>
              <Button onClick={() => router.push("/orders")}>View Your Orders</Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}

