"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUp, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadFileToS3 } from "@/lib/client-utils"

type PDFUploaderProps = {
  onComplete: (file: File, fileUrl: string) => void
}

export function PDFUploaderS3({ onComplete }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 200)

      // Upload to S3 via API route
      console.log("Client - Starting file upload", file.name)
      const result = await uploadFileToS3(file)
      console.log("Client - Upload result:", result)

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast({
        title: "File uploaded successfully",
        description: "Your PDF is ready for printing",
      })

      // Wait a moment before proceeding
      setTimeout(() => {
        onComplete(file, result.url)
      }, 1000)
    } catch (error) {
      console.error("Client - Unexpected error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Your PDF</h2>
        <p className="text-gray-500 dark:text-gray-400">Upload the document you want to have printed and mailed</p>
      </div>

      {!file ? (
        <Card className="border-dashed border-2 p-10 text-center">
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Drag and drop your PDF here</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse (max 10MB)</p>
            <Button variant="outline">Select PDF</Button>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <File className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remove file">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <Button className="w-full" onClick={handleUpload}>
              Continue
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}

