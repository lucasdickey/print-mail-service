import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

let client: S3Client | null = null

function getClient(): S3Client {
  if (!client) {
    const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env
    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials are not fully configured")
    }
    client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })
  }
  return client
}

// Uploads a PDF to S3 and returns its public URL. Lob fetches the file from
// this URL, so the bucket must allow public reads on the pdfs/ prefix.
export async function uploadPdfToS3(body: Buffer, fileName: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not set")
  }

  const safeName = encodeURIComponent(fileName.replace(/\s+/g, "-"))
  const key = `pdfs/${Date.now()}-${safeName}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
    }),
  )

  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}
