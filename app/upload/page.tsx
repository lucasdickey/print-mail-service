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
import { UploadIcon as FileUpload, File, ArrowRight } from "lucide-react"
import { uploadFile } from "@/lib/actions"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const mailType = searchParams.get("type") || "standard"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadFile(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      // Navigate to address page with file info
      router.push(
        `/address?fileUrl=${encodeURIComponent(result.url)}&fileName=${encodeURIComponent(result.fileName)}&fileSize=${result.fileSize}&type=${mailType}`,
      )
    } catch (error) {
      clearInterval(progressInterval)
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Your Document</h1>
          <p className="text-gray-500 mt-2">
            Upload a PDF document to be printed and mailed. We accept files up to 10MB.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      {file ? (
                        <div className="space-y-2">
                          <File className="h-8 w-8 mx-auto text-primary" />
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <Button type="button" variant="outline" onClick={() => setFile(null)} className="mt-2">
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileUpload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm font-medium">Drag and drop your PDF here</p>
                          <p className="text-xs text-gray-500">or</p>
                          <div>
                            <Label
                              htmlFor="file-upload"
                              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                            >
                              Browse Files
                            </Label>
                            <Input
                              id="file-upload"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Supported file: PDF only (max 10MB)</p>
                        </div>
                      )}
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={!file || isUploading}>
                      {isUploading ? "Uploading..." : "Continue to Address"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Selected Service</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{mailType === "premium" ? "Premium Mail" : "Standard Mail"}</span>
                    <span className="font-bold">${mailType === "premium" ? "4.99" : "2.99"}</span>
                  </div>
                  <ul className="text-sm space-y-2 text-gray-500">
                    {mailType === "premium" ? (
                      <>
                        <li>• Up to 10 pages (color available)</li>
                        <li>• Premium envelope</li>
                        <li>• Priority mail</li>
                        <li>• 2-3 business days delivery</li>
                      </>
                    ) : (
                      <>
                        <li>• Up to 6 pages (black & white)</li>
                        <li>• Standard envelope</li>
                        <li>• First-class mail</li>
                        <li>• 3-5 business days delivery</li>
                      </>
                    )}
                  </ul>
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => router.push("/pricing")}>
                      Change Service
                    </Button>
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

