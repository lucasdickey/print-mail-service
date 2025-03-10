"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUp, File, X, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type PDFUploaderProps = {
  onComplete: (file: File, fileUrl: string) => void
}

export function PDFUploader({ onComplete }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isMockImplementation, setIsMockImplementation] = useState(false)
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

      console.log("Client - Starting file upload to S3", file.name)
      
      // Read the file as base64
      const reader = new FileReader()
      
      // Create a promise to handle the FileReader
      const base64Result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to read file as base64'))
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      
      console.log("Client - Base64 encoding completed, uploading to S3...")
      
      // Upload the file to S3 via our API endpoint
      const uploadResponse = await fetch('/api/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fileData: base64Result,
          fileName: file.name
        }),
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload file to S3");
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success || !uploadResult.fileUrl) {
        throw new Error("Failed to get file URL from S3");
      }
      
      console.log("Client - File uploaded to S3 successfully");
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadResult.message && uploadResult.message.includes('mock implementation')) {
        setIsMockImplementation(true);
      } else {
        setIsMockImplementation(false);
      }

      toast({
        title: "File uploaded successfully",
        description: "Your PDF is ready for printing",
      })

      // Wait a moment before proceeding
      setTimeout(() => {
        onComplete(file, uploadResult.fileUrl)
      }, 1000)
    } catch (error) {
      console.error("Client - Upload error:", error)
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
    setIsMockImplementation(false)
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
            className="flex flex-col items-center justify-center"
          >
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Drag and drop your PDF here</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse (max 10MB)</p>
            <input
              type="file"
              accept="application/pdf"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
              onChange={(e) => {
                console.log("File input change event triggered", e.target.files);
                handleFileChange(e);
              }}
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
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                {uploadProgress < 100 ? (
                  <>Uploading... {uploadProgress}%</>
                ) : (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </div>
                )}
              </p>
            </div>
          ) : (
            <Button className="w-full" onClick={handleUpload}>
              Upload to S3
            </Button>
          )}
          {isMockImplementation && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Mock S3 Upload</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This is using a mock S3 implementation. In production, the file would be uploaded to an actual S3 bucket.
                      To enable real S3 uploads, configure valid AWS credentials in the .env.local file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
