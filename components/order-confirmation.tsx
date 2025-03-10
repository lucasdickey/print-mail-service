"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { OrderData } from "./print-mail-wizard"
import { CheckCircle2, Printer, Truck } from "lucide-react"
import Link from "next/link"

type OrderConfirmationProps = {
  orderData: OrderData
}

export function OrderConfirmation({ orderData }: OrderConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 dark:text-gray-400">Your document has been sent to our printing facility</p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Order Details</h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Printer className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Document</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{orderData.file?.name || "Document.pdf"}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Truck className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Delivery Address</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {orderData.address?.name}
                <br />
                {orderData.address?.line1}
                <br />
                {orderData.address?.line2 && (
                  <>
                    {orderData.address.line2}
                    <br />
                  </>
                )}
                {orderData.address?.city}, {orderData.address?.state} {orderData.address?.zip}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="font-medium mb-1">Order ID</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{orderData.orderId || "ORD-12345678"}</p>

            <p className="font-medium mb-1 mt-3">Tracking ID</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{orderData.trackingId || "TRK-87654321"}</p>

            <p className="font-medium mb-1 mt-3">Expected Delivery</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {orderData.expectedDelivery || "3-5 business days"}
            </p>

            <p className="font-medium mb-1 mt-3">Total Paid</p>
            <p className="text-lg font-bold text-primary">${orderData.price?.toFixed(2) || "5.99"}</p>
          </div>
        </div>
      </Card>

      {orderData.isMockLob && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>Note:</strong> This is using a mock mailing service. In production, your document would be sent via Lob's actual printing and mailing service.
          </p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button asChild>
          <Link href="/">Print Another Document</Link>
        </Button>
      </div>
    </div>
  )
}
