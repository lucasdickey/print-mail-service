import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Truck, BookOpen, Clock, Tag, ListFilter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

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
      ]
    }
  },
]

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/orders/${order.id}`}>
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.price.toFixed(2)}</p>
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
                    </div>

                    <div className="flex items-start space-x-3 mb-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Document</p>
                        <p className="text-sm text-gray-500">{order.documentName}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 mb-3">
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

                    {order.analysis && (
                      <Accordion type="single" collapsible className="mt-4">
                        <AccordionItem value="analysis">
                          <AccordionTrigger className="text-primary font-medium">
                            Document Analysis
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div className="grid grid-cols-2 gap-4">
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
                                
                                <div className="flex items-center space-x-2">
                                  <ListFilter className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Themes:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {order.analysis.themes.map((theme, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Summary</h4>
                                <p className="text-sm text-gray-700">{order.analysis.summary}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Key Phrases</h4>
                                <div className="flex flex-wrap gap-1">
                                  {order.analysis.keyPhrases.map((phrase, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{phrase}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Entities</h4>
                                <div className="flex flex-wrap gap-1">
                                  {order.analysis.entities.map((entity, i) => (
                                    <div key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                                      <span className="font-medium">{entity.name}</span>
                                      <span className="text-gray-500 ml-1">({entity.type})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
