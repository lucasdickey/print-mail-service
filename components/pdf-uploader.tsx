"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { File, FileUp, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

type PDFUploaderProps = {
  onComplete: (file: File, fileUrl: string) => void
}

export function PDFUploader({ onComplete }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
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

    if (selectedFile.size > MAX_FILE_SIZE) {
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

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Failed to upload file")
      }

      toast({
        title: "File uploaded successfully",
        description: "Your PDF is ready for printing",
      })

      onComplete(file, result.url)
    } catch (error) {
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
          <div className="flex flex-col items-center justify-center">
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

          <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </Card>
      )}
    </div>
  )
}
