import { z } from "zod"
import { getLob } from "./lob"

// Price to print and mail one document, in USD. Expressed as a decimal string
// because the Machine Payments Protocol charge amount is a decimal string.
export const PRICE_USD = "5.99"

export type MailType = "standard" | "premium"

export const addressSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  address_city: z.string().min(1),
  address_state: z.string().min(1),
  address_zip: z.string().min(1),
  address_country: z.string().min(1),
})

export type MailingAddress = z.infer<typeof addressSchema>

export type MailingResult = {
  trackingId: string
  trackingNumber?: string
  expectedDelivery?: string
}

const FROM_ADDRESS = {
  name: "PrintMail Service",
  address_line1: "123 Main St",
  address_city: "San Francisco",
  address_state: "CA",
  address_zip: "94103",
  address_country: "US",
}

// Lob fetches the document over HTTP, so it must be hosted on S3.
export function isS3Url(url: string): boolean {
  return url.includes("amazonaws.com")
}

export async function createMailing(input: {
  fileUrl: string
  address: MailingAddress
  mailType?: MailType
}): Promise<MailingResult> {
  const mailType = input.mailType ?? "standard"

  const letter = await getLob().letters.create({
    description: `Letter for ${input.address.name}`,
    to: input.address,
    from: FROM_ADDRESS,
    file: input.fileUrl,
    color: mailType === "premium",
    double_sided: true,
    address_placement: "insert_blank_page",
    mail_type: mailType === "premium" ? "usps_first_class" : "usps_standard",
    use_type: "operational",
  })

  return {
    trackingId: letter.id,
    trackingNumber: letter.tracking_number,
    expectedDelivery: letter.expected_delivery_date,
  }
}
