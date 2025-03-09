"use client"

export async function uploadFileToS3(file: File) {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload file")
    }

    return await response.json()
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}

