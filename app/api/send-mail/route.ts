import { NextResponse } from "next/server"
import Stripe from "stripe"
import Lob from "lob"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
})

// Initialize Lob
const lob = new Lob(process.env.LOB_API_KEY!)

export async function POST(request: Request) {
  try {
    console.log("Received request to send mail");
    const body = await request.json();
    console.log("Request body received");
    
    const { paymentIntentId, orderDetails } = body;
    
    if (!orderDetails) {
      console.error("No order details provided");
      return NextResponse.json({ 
        error: "No order details provided" 
      }, { status: 400 });
    }
    
    console.log("Payment Intent ID:", paymentIntentId);
    console.log("Order Details:", JSON.stringify({
      ...orderDetails,
      fileUrl: orderDetails.fileUrl ? `${orderDetails.fileUrl.substring(0, 50)}...` : null // Truncate for logging
    }, null, 2));
    
    // Check if we have a file URL
    if (!orderDetails.fileUrl) {
      console.error("No file URL provided");
      return NextResponse.json({ 
        error: "No file URL provided" 
      }, { status: 400 });
    }
    
    // Verify that the file URL is a valid S3 or mock S3 URL
    if (!orderDetails.fileUrl.includes('s3.amazonaws.com') && !orderDetails.fileUrl.includes('mock-s3-bucket')) {
      console.error("Invalid file URL format. Expected S3 URL but got:", orderDetails.fileUrl.substring(0, 50) + "...");
      return NextResponse.json({ 
        error: "Invalid file URL format. Expected S3 URL." 
      }, { status: 400 });
    }
    
    console.log("File URL verified, creating letter with Lob");
    
    // For demonstration purposes, we'll use a mock Lob response
    // In production, you would use the actual Lob API with the S3 URL
    try {
      // Generate a mock Lob response
      const mockLobResponse = {
        id: `ltr_${Math.random().toString(36).substring(2, 10)}`,
        tracking_number: `trk_${Math.random().toString(36).substring(2, 10)}`,
        expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
      
      console.log("Mock Lob response:", mockLobResponse);
      
      // In production, you would use code like this:
      /*
      const letter = await lob.letters.create({
        description: `Letter for ${orderDetails.address.name}`,
        to: {
          name: orderDetails.address.name,
          address_line1: orderDetails.address.address_line1,
          address_line2: orderDetails.address.address_line2 || '',
          address_city: orderDetails.address.address_city,
          address_state: orderDetails.address.address_state,
          address_zip: orderDetails.address.address_zip,
          address_country: orderDetails.address.address_country,
        },
        from: {
          name: "PrintMail Service",
          address_line1: "123 Main St",
          address_city: "San Francisco",
          address_state: "CA",
          address_zip: "94103",
          address_country: "US",
        },
        file: orderDetails.fileUrl, // Use the pre-uploaded S3 URL
        color: orderDetails.mailType === "premium",
        double_sided: true,
        address_placement: "insert_blank_page",
        mail_type: orderDetails.mailType === "premium" ? "usps_first_class" : "standard",
      });
      */
      
      // Return the mock response
      return NextResponse.json({
        success: true,
        lobId: mockLobResponse.id,
        trackingId: mockLobResponse.tracking_number,
        expectedDelivery: mockLobResponse.expected_delivery_date,
        message: "This is a mock response. In production, Lob would use the pre-uploaded S3 URL."
      });
    } catch (lobError: any) {
      console.error("Error creating letter with Lob:", lobError);
      return NextResponse.json({ 
        error: "Error creating letter with Lob: " + (lobError.message || "Unknown error")
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error sending mail:", error);
    return NextResponse.json({ 
      error: "Error sending mail: " + (error.message || "Unknown error") 
    }, { status: 500 });
  }
}
