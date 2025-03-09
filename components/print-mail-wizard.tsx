"use client"

import { useState } from "react"
import { PDFUploader } from "./pdf-uploader"
// Uncomment this if you want to use the S3 approach instead
// import { PDFUploaderS3 } from "./pdf-uploader-s3"
import { AddressForm } from "./address-form"
import { PaymentForm } from "./payment-form"
import { OrderConfirmation } from "./order-confirmation"
import { Card } from "@/components/ui/card"
import { Steps } from "./steps"

type Step = "upload" | "address" | "payment" | "confirmation"

export type OrderData = {
  file?: File
  fileUrl?: string
  address?: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  price?: number
  orderId?: string
  trackingId?: string
  expectedDelivery?: string
}

export function PrintMailWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [orderData, setOrderData] = useState<OrderData>({})

  const steps = [
    { id: "upload", label: "Upload PDF" },
    { id: "address", label: "Enter Address" },
    { id: "payment", label: "Payment" },
    { id: "confirmation", label: "Confirmation" },
  ]

  const handleNext = () => {
    if (currentStep === "upload") setCurrentStep("address")
    else if (currentStep === "address") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("confirmation")
  }

  const handleBack = () => {
    if (currentStep === "address") setCurrentStep("upload")
    else if (currentStep === "payment") setCurrentStep("address")
  }

  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }))
  }

  return (
    <Card className="p-6">
      <Steps steps={steps} currentStep={currentStep} className="mb-8" />

      {currentStep === "upload" && (
        <PDFUploader
          onComplete={(file, fileUrl) => {
            updateOrderData({ file, fileUrl })
            handleNext()
          }}
        />
        // If you want to use the S3 approach instead, use this:
        // <PDFUploaderS3
        //   onComplete={(file, fileUrl) => {
        //     updateOrderData({ file, fileUrl })
        //     handleNext()
        //   }}
        // />
      )}

      {currentStep === "address" && (
        <AddressForm
          onSubmit={(address) => {
            updateOrderData({ address })
            handleNext()
          }}
          onBack={handleBack}
          initialData={orderData.address}
        />
      )}

      {currentStep === "payment" && (
        <PaymentForm
          orderData={orderData}
          onComplete={(paymentData) => {
            updateOrderData(paymentData)
            handleNext()
          }}
          onBack={handleBack}
        />
      )}

      {currentStep === "confirmation" && <OrderConfirmation orderData={orderData} />}
    </Card>
  )
}

