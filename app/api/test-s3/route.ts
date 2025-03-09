import { NextResponse } from "next/server"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"

export async function GET() {
  try {
    console.log("Testing S3 connection")
    console.log(`AWS Region: ${process.env.AWS_REGION}`)
    console.log(`S3 Bucket: ${process.env.S3_BUCKET_NAME}`)

    // Initialize S3 client with explicit credentials
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })

    // Test connection by listing buckets
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}))

    return NextResponse.json({
      success: true,
      message: "S3 connection successful",
      buckets: Buckets?.map((b) => b.Name) || [],
      targetBucket: process.env.S3_BUCKET_NAME,
      bucketFound: Buckets?.some((b) => b.Name === process.env.S3_BUCKET_NAME),
      region: process.env.AWS_REGION,
    })
  } catch (error) {
    console.error("S3 test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        region: process.env.AWS_REGION,
        bucket: process.env.S3_BUCKET_NAME,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      },
      { status: 500 },
    )
  }
}

