import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    s3BucketName: process.env.S3_BUCKET_NAME,
    awsRegion: process.env.AWS_REGION,
    // Don't include sensitive values like access keys in production!
    hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  })
}

