"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFileBase64 } from "@/lib/actions"
import { Navbar } from "@/components/navbar"

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResult = await uploadFileBase64(formData)
      setResult(uploadResult)

      // Display only the first 100 characters of the URL to avoid cluttering the UI
      if (uploadResult.url) {
        uploadResult.urlPreview = uploadResult.url.substring(0, 100) + "..."
      }
    } catch (error) {
      console.error("Test upload error:", error)
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Test Base64 Upload</h1>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Upload Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select PDF File</Label>
                <Input id="file" type="file" accept="application/pdf" onChange={handleFileChange} />
              </div>

              <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full">
                {isLoading ? "Uploading..." : "Test Upload"}
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium mb-2">Result:</h3>
                  <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

