"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { UploadIcon as FileUpload, File, ArrowRight } from "lucide-react"
import { uploadFile } from "@/lib/actions"

// Document type options
const documentTypes = [
  "Blog Post",
  "Academic White Paper",
  "Sales Case Study",
  "Poem",
  "Speech",
  "Transcribed Podcast",
  "Research Paper",
  "Technical Documentation",
  "Book Chapter",
  "News Article",
  "Other"
];

// Ownership status options
const ownershipStatuses = [
  "I originated and own this document",
  "I'm part of a team that originated and own this document",
  "I'm a company that owns this document",
  "I do not own this document",
  "This document is in public domain"
];

// Content rating options
const contentRatings = [
  "General",
  "Academic",
  "Professional",
  "Mature"
];

// Target audience options
const targetAudiences = [
  "General",
  "Academic",
  "Professional",
  "Technical",
  "Children",
  "Young Adults",
  "Adults"
];

// Language options
const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Other"
];

// Define the upload result type
interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  documentId?: string;
  error?: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPublic, setIsPublic] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const [description, setDescription] = useState("")
  const [documentType, setDocumentType] = useState(documentTypes[0])
  const [ownershipStatus, setOwnershipStatus] = useState(ownershipStatuses[0])
  const [tags, setTags] = useState("")
  const [language, setLanguage] = useState(languages[0])
  const [publicationYear, setPublicationYear] = useState<number | undefined>(undefined)
  const [targetAudience, setTargetAudience] = useState(targetAudiences[0])
  const [contentRating, setContentRating] = useState(contentRatings[0])
  const [isOriginalWork, setIsOriginalWork] = useState(true)
  const [uploaderName, setUploaderName] = useState("")
  const [uploaderEmail, setUploaderEmail] = useState("")
  
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

    if (isPublic && !documentName) {
      toast({
        title: "Document name required",
        description: "Please provide a name for your document",
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
      
      // Add metadata to formData
      formData.append("isPublic", isPublic.toString())
      formData.append("documentName", documentName || file.name)
      formData.append("description", description)
      formData.append("documentType", documentType)
      formData.append("ownershipStatus", ownershipStatus)
      formData.append("tags", tags)
      formData.append("language", language)
      formData.append("publicationYear", publicationYear?.toString() || "")
      formData.append("targetAudience", targetAudience)
      formData.append("contentRating", contentRating)
      formData.append("isOriginalWork", isOriginalWork.toString())
      formData.append("uploaderName", uploaderName)
      formData.append("uploaderEmail", uploaderEmail)

      const result = await uploadFile(formData) as UploadResult

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

      // Trigger document analysis for all documents
      if (result.documentId) {
        try {
          // Call the analyze-document API
          await fetch('/api/analyze-document', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentId: result.documentId,
              documentName: documentName || file.name,
              documentType,
              description,
              fileUrl: result.url,
              metadata: {
                language,
                publicationYear,
                targetAudience,
                contentRating,
                tags,
                isOriginalWork,
                uploaderName
              }
            }),
          });
        } catch (analysisError) {
          console.error("Error analyzing document:", analysisError);
          // Continue even if analysis fails
        }
      }

      // Navigate to address page with file info
      const queryParams = new URLSearchParams({
        fileUrl: result.url,
        fileName: result.fileName,
        fileSize: result.fileSize.toString(),
        type: mailType
      });
      
      if (result.documentId) {
        queryParams.append('documentId', result.documentId);
      }
      
      router.push(`/address?${queryParams.toString()}`);
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

                    {/* Public Document Repository Options */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="public-toggle" className="font-medium">Make Document Public</Label>
                          <p className="text-sm text-gray-500">Share this document in our public repository</p>
                        </div>
                        <Switch
                          id="public-toggle"
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                        />
                      </div>

                      {/* Document Metadata - Show only when a file is uploaded */}
                      {file && (
                        <div className="space-y-4 pt-4 mt-4 border-t">
                          <h3 className="text-lg font-semibold">Document Metadata</h3>
                          <p className="text-sm text-gray-500 mb-4">This information helps us provide better document analysis</p>
                          
                          <div className="space-y-2">
                            <Label htmlFor="document-name">Document Name{isPublic && "*"}</Label>
                            <Input
                              id="document-name"
                              placeholder="Enter a name for your document"
                              value={documentName}
                              onChange={(e) => setDocumentName(e.target.value)}
                              required={isPublic}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="document-description">Description</Label>
                            <Textarea
                              id="document-description"
                              placeholder="Provide a brief description of your document"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="document-type">Document Type</Label>
                            <Select value={documentType} onValueChange={setDocumentType}>
                              <SelectTrigger id="document-type">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ownership-status">Ownership Status</Label>
                            <Select value={ownershipStatus} onValueChange={setOwnershipStatus}>
                              <SelectTrigger id="ownership-status">
                                <SelectValue placeholder="Select ownership status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ownershipStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                              id="tags"
                              placeholder="e.g., science, research, technology"
                              value={tags}
                              onChange={(e) => setTags(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="language">Language</Label>
                              <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger id="language">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {languages.map((lang) => (
                                    <SelectItem key={lang} value={lang}>
                                      {lang}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="publication-year">Publication Year</Label>
                              <Input
                                id="publication-year"
                                type="number"
                                placeholder="e.g., 2023"
                                value={publicationYear || ""}
                                onChange={(e) => setPublicationYear(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="target-audience">Target Audience</Label>
                              <Select value={targetAudience} onValueChange={setTargetAudience}>
                                <SelectTrigger id="target-audience">
                                  <SelectValue placeholder="Select target audience" />
                                </SelectTrigger>
                                <SelectContent>
                                  {targetAudiences.map((audience) => (
                                    <SelectItem key={audience} value={audience}>
                                      {audience}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="content-rating">Content Rating</Label>
                              <Select value={contentRating} onValueChange={setContentRating}>
                                <SelectTrigger id="content-rating">
                                  <SelectValue placeholder="Select content rating" />
                                </SelectTrigger>
                                <SelectContent>
                                  {contentRatings.map((rating) => (
                                    <SelectItem key={rating} value={rating}>
                                      {rating}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="original-work" className="font-medium">Original Work</Label>
                              <p className="text-sm text-gray-500">Is this an original work?</p>
                            </div>
                            <Switch
                              id="original-work"
                              checked={isOriginalWork}
                              onCheckedChange={setIsOriginalWork}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="uploader-name">Your Name</Label>
                            <Input
                              id="uploader-name"
                              placeholder="Enter your name"
                              value={uploaderName}
                              onChange={(e) => setUploaderName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="uploader-email">Your Email</Label>
                            <Input
                              id="uploader-email"
                              type="email"
                              placeholder="Enter your email"
                              value={uploaderEmail}
                              onChange={(e) => setUploaderEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

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
