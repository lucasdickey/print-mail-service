"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, ArrowLeft, File } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries"

export default function AddressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const fileUrl = searchParams.get("fileUrl") || ""
  const fileName = searchParams.get("fileName") || ""
  const fileSize = Number.parseInt(searchParams.get("fileSize") || "0")
  const mailType = searchParams.get("type") || "standard"

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    address_line1: "",
    address_line2: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    address_country: "US",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (
      !formData.name ||
      !formData.address_line1 ||
      !formData.address_city ||
      !formData.address_state ||
      !formData.address_zip ||
      !formData.address_country
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Navigate to checkout with all the information
    const queryParams = new URLSearchParams({
      fileUrl,
      fileName,
      fileSize: fileSize.toString(),
      type: mailType,
      ...formData,
    })

    router.push(`/checkout?${queryParams.toString()}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Enter Mailing Address</h1>
          <p className="text-gray-500 mt-2">Provide the address where you want your document to be delivered.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Recipient Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line1">Address Line 1 *</Label>
                      <Input
                        id="address_line1"
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        placeholder="123 Main St"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address_line2"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleChange}
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_city">City *</Label>
                        <Input
                          id="address_city"
                          name="address_city"
                          value={formData.address_city}
                          onChange={handleChange}
                          placeholder="New York"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address_state">State/Province *</Label>
                        <Input
                          id="address_state"
                          name="address_state"
                          value={formData.address_state}
                          onChange={handleChange}
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_zip">ZIP/Postal Code *</Label>
                        <Input
                          id="address_zip"
                          name="address_zip"
                          value={formData.address_zip}
                          onChange={handleChange}
                          placeholder="10001"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address_country">Country *</Label>
                        <Select
                          value={formData.address_country}
                          onValueChange={(value) => handleSelectChange("address_country", value)}
                        >
                          <SelectTrigger id="address_country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>

                      <Button type="submit">
                        Continue to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Document Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <File className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{fileName}</p>
                      <p className="text-xs text-gray-500">{(fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{mailType === "premium" ? "Premium Mail" : "Standard Mail"}</span>
                      <span className="font-bold">${mailType === "premium" ? "4.99" : "2.99"}</span>
                    </div>
                    <ul className="text-sm space-y-2 text-gray-500 mt-2">
                      {mailType === "premium" ? (
                        <>
                          <li>• Color printing available</li>
                          <li>• 2-3 business days delivery</li>
                        </>
                      ) : (
                        <>
                          <li>• Black & white printing</li>
                          <li>• 3-5 business days delivery</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

