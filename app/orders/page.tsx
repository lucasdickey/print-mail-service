import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Truck } from "lucide-react"

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
  },
  {
    id: "ord_789012",
    date: "2023-10-28",
    documentName: "Contract_Agreement.pdf",
    status: "In Transit",
    trackingId: "TRK-HIJKLMN",
    deliveryDate: "2023-11-02",
    price: 5.99,
  },
]

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.price.toFixed(2)}</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.documentName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Truck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Shipping</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tracking ID: {order.trackingId}
                        <br />
                        Expected Delivery: {order.deliveryDate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

