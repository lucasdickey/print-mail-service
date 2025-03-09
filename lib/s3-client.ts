import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Initialize S3 client with explicit credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  // Explicitly provide credentials to avoid filesystem access
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // Disable credential loading from shared files
  credentialDefaultProvider: () => async () => {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
  },
})

export async function uploadToS3(file: Buffer, fileName: string, contentType: string): Promise<string> {
  try {
    console.log("S3 Upload - Starting upload process")
    console.log(`S3 Upload - Bucket: ${process.env.S3_BUCKET_NAME}`)
    console.log(`S3 Upload - Region: ${process.env.AWS_REGION}`)

    const key = `pdfs/${Date.now()}-${fileName}`

    // Upload file to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        // Remove ACL if your bucket has ACLs disabled
        // ACL: "public-read",
      }),
    )

    // For simplicity, return a direct S3 URL instead of a signed URL
    // This avoids additional AWS SDK calls that might use filesystem
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  } catch (error) {
    console.error("S3 Upload - Error details:", error)
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

