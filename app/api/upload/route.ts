import { NextResponse } from "next/server"
import { uploadPdfToS3 } from "@/lib/s3"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds the 10MB limit" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadPdfToS3(buffer, file.name)

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
