"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Truck, ArrowLeft, BookOpen, Clock, Tag, ListFilter, FileBox, Users, Hash } from "lucide-react"

// In a real app, this would fetch from a database
const mockOrders = [
  {
    id: "ord_123456",
    date: "2023-11-15",
    documentName: "Tax_Return_2023.pdf",
    status: "Delivered",
    trackingId: "TRK-ABCDEFG",
    deliveryDate: "2023-11-18",
    price: 5.99,
    analysis: {
      category: "Legal",
      summary: "This tax return document contains financial information for the 2023 fiscal year. It includes income statements, deductions, and tax calculations. The document follows standard IRS formatting and includes all required schedules.",
      themes: ["Taxation", "Finance", "Legal Compliance"],
      readingLevel: "College",
      estimatedReadTime: "25 minutes",
      keyPhrases: ["Tax Deduction", "Adjusted Gross Income", "Capital Gains", "Itemized Deductions", "Tax Credit"],
      entities: [
        { type: "organization", name: "Internal Revenue Service" },
        { type: "person", name: "John Doe" }
      ],
      socialHandles: [],
      citations: ["IRS Publication 17", "Tax Code Section 401(k)"],
      tableOfContents: [
        "Personal Information",
        "Income",
        "Deductions",
        "Credits",
        "Payments",
        "Refund"
      ]
    }
  },
  {
    id: "ord_789012",
    date: "2023-10-28",
    documentName: "Contract_Agreement.pdf",
    status: "In Transit",
    trackingId: "TRK-HIJKLMN",
    deliveryDate: "2023-11-02",
    price: 5.99,
    analysis: {
      category: "Business",
      summary: "This contract agreement outlines the terms and conditions between two parties for software development services. It specifies deliverables, payment terms, intellectual property rights, and confidentiality clauses. The agreement is valid for one year with options for renewal.",
      themes: ["Business Contract", "Software Development", "Legal Agreement"],
      readingLevel: "Graduate",
      estimatedReadTime: "35 minutes",
      keyPhrases: ["Terms and Conditions", "Intellectual Property", "Confidentiality", "Service Level Agreement", "Termination Clause"],
      entities: [
        { type: "company", name: "Acme Software Inc." },
        { type: "company", name: "TechSolutions LLC" }
      ],
      socialHandles: ["@AcmeSoftware", "@TechSolutionsLLC"],
      citations: ["Software Development Agreement Template v2.1"],
      tableOfContents: [
        "Parties",
        "Scope of Work",
        "Deliverables",
        "Payment Terms",
        "Intellectual Property",
        "Confidentiality",
        "Term and Termination",
        "Warranties",
        "Limitation of Liability",
        "General Provisions"
      ]
    }
  },
]

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const orderId = params.id as string
    const foundOrder = mockOrders.find(o => o.id === orderId)
    
    if (foundOrder) {
      setOrder(foundOrder)
    }
    
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <p>Loading order details...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="mb-6">We couldn't find the order you're looking for.</p>
            <Button onClick={() => router.push("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/orders")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{order.date}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">${order.price.toFixed(2)}</p>
                </div>
                
                <Separator />
                
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Document</p>
                    <p className="text-sm text-gray-500">{order.documentName}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-gray-500">
                      Tracking ID: {order.trackingId}
                      <br />
                      Expected Delivery: {order.deliveryDate}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Analysis */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {order.analysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="outline">{order.analysis.category}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Reading Level:</span>
                      <span className="text-sm">{order.analysis.readingLevel}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Read Time:</span>
                      <span className="text-sm">{order.analysis.estimatedReadTime}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                    <p className="text-gray-700">{order.analysis.summary}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {order.analysis.themes.map((theme: string, i: number) => (
                        <Badge key={i} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Key Phrases</h3>
                    <div className="flex flex-wrap gap-2">
                      {order.analysis.keyPhrases.map((phrase: string, i: number) => (
                        <Badge key={i} variant="outline">{phrase}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {order.analysis.entities.map((entity: any, i: number) => (
                        <div key={i} className="bg-gray-100 px-3 py-1 rounded-md">
                          <span className="font-medium">{entity.name}</span>
                          <span className="text-gray-500 ml-1">({entity.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {order.analysis.socialHandles && order.analysis.socialHandles.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Social Handles</h3>
                        <div className="flex flex-wrap gap-2">
                          {order.analysis.socialHandles.map((handle: string, i: number) => (
                            <Badge key={i} variant="outline">{handle}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {order.analysis.citations && order.analysis.citations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Citations</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {order.analysis.citations.map((citation: string, i: number) => (
                            <li key={i} className="text-gray-700">{citation}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  
                  {order.analysis.tableOfContents && order.analysis.tableOfContents.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Table of Contents</h3>
                        <ol className="list-decimal pl-5 space-y-1">
                          {order.analysis.tableOfContents.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No analysis available for this document.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
