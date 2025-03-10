import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    console.log("Received request to upload file");
    const body = await request.json();
    console.log("Request body received");
    
    // Extract the file data
    const { fileData, fileName } = body;
    
    if (!fileData || !fileName) {
      console.error("Missing file data or file name");
      return NextResponse.json({ 
        error: "Missing file data or file name" 
      }, { status: 400 });
    }
    
    console.log(`Processing file upload for: ${fileName}`);
    
    // Check environment variables
    const awsRegion = process.env.AWS_REGION;
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsS3Bucket = process.env.AWS_S3_BUCKET;
    
    console.log("AWS Environment Variables Check:");
    console.log("AWS_REGION:", awsRegion ? "Set" : "Not set");
    console.log("AWS_ACCESS_KEY_ID:", awsAccessKeyId ? "Set" : "Not set");
    console.log("AWS_SECRET_ACCESS_KEY:", awsSecretAccessKey ? "Set" : "Not set");
    console.log("AWS_S3_BUCKET:", awsS3Bucket ? "Set" : "Not set");
    
    // Check if AWS credentials are placeholder values
    const usingPlaceholderCredentials = 
      awsAccessKeyId === "your_aws_access_key_id" || 
      awsSecretAccessKey === "your_aws_secret_access_key";
    
    // If AWS credentials are not set or are placeholder values, use mock implementation
    if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey || !awsS3Bucket || usingPlaceholderCredentials) {
      console.log("AWS credentials not properly configured. Using mock implementation.");
      if (usingPlaceholderCredentials) {
        console.log("WARNING: You are using placeholder AWS credentials. Please update your .env.local file with actual AWS credentials.");
      }
      
      // Generate a mock S3 URL
      const mockS3Url = `https://mock-s3-bucket.s3.amazonaws.com/pdfs/${Date.now()}-${fileName}`;
      console.log("Generated mock S3 URL:", mockS3Url);
      
      return NextResponse.json({
        success: true,
        fileUrl: mockS3Url,
        message: "File upload simulated (mock implementation). To upload to actual S3, configure AWS credentials in .env.local"
      });
    }
    
    // Convert base64 to buffer
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a unique key for the S3 object
    const key = `pdfs/${Date.now()}-${fileName}`;
    
    try {
      // Upload to S3
      console.log(`Uploading to S3 bucket: ${awsS3Bucket}, key: ${key}`);
      
      const putCommand = new PutObjectCommand({
        Bucket: awsS3Bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
        // ACL parameter removed since ACLs are disabled on the bucket
      });
      
      await s3Client.send(putCommand);
      
      // Generate a URL for the uploaded file
      // For buckets with website hosting enabled, use the website endpoint
      // Otherwise use the S3 endpoint
      const fileUrl = `https://${awsS3Bucket}.s3.${awsRegion}.amazonaws.com/${key}`;
      console.log("File uploaded to S3 successfully:", fileUrl);
      
      return NextResponse.json({
        success: true,
        fileUrl: fileUrl,
        message: "File uploaded to S3 successfully"
      });
    } catch (error: any) {
      console.error("Error uploading to S3:", error);
      
      // Check for specific AWS errors
      if (error.Code === 'InvalidAccessKeyId' || error.Code === 'SignatureDoesNotMatch') {
        console.log("Invalid AWS credentials. Falling back to mock implementation.");
        
        // Generate a mock S3 URL as fallback
        const mockS3Url = `https://mock-s3-bucket.s3.amazonaws.com/pdfs/${Date.now()}-${fileName}`;
        console.log("Generated mock S3 URL as fallback:", mockS3Url);
        
        return NextResponse.json({
          success: true,
          fileUrl: mockS3Url,
          message: "Using mock implementation due to invalid AWS credentials. Please update your .env.local file with valid AWS credentials."
        });
      }
      
      // Provide detailed error information
      return NextResponse.json({ 
        error: "Failed to upload to S3: " + (error.message || "Unknown error"),
        details: error.Code || error.name || "No error details available",
        requestId: error.$metadata?.requestId || "No request ID available"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error processing upload request:", error);
    return NextResponse.json({ 
      error: "Error processing upload request: " + (error.message || "Unknown error") 
    }, { status: 500 });
  }
}
