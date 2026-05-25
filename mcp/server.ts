import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema, type Tool } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import { getMcpMpp } from "../lib/mpp"
import { PRICE_USD, addressSchema, createMailing, isS3Url } from "../lib/print-mail"

// MCP server exposing the print-and-mail service to agents. The paid tool is
// gated behind the Machine Payments Protocol: an unpaid call returns a JSON-RPC
// error (code -32042) carrying the payment challenge; the agent's MPP-aware
// client pays and retries with the credential in the request `_meta`.
//
// We use the low-level `Server` (not `McpServer`) because `McpServer` wraps
// thrown errors into `isError` tool results, which would strip the structured
// -32042 challenge that an MPP client needs.

const printMailArgs = addressSchema.extend({
  fileUrl: z.string().url(),
  mailType: z.enum(["standard", "premium"]).default("standard"),
  address_country: z.string().default("US"),
})

const TOOLS: Tool[] = [
  {
    name: "get_pricing",
    description: "Get the price in USD to print and mail one document.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "print_and_mail",
    description:
      "Print a PDF and mail it to a physical US address. The PDF must already be hosted at a publicly accessible S3 URL. Requires payment via the Machine Payments Protocol (MPP).",
    inputSchema: {
      type: "object",
      properties: {
        fileUrl: { type: "string", description: "Publicly accessible S3 URL of the PDF to mail" },
        mailType: { type: "string", enum: ["standard", "premium"], default: "standard" },
        name: { type: "string" },
        company: { type: "string" },
        address_line1: { type: "string" },
        address_line2: { type: "string" },
        address_city: { type: "string" },
        address_state: { type: "string" },
        address_zip: { type: "string" },
        address_country: { type: "string", default: "US" },
      },
      required: ["fileUrl", "name", "address_line1", "address_city", "address_state", "address_zip"],
    },
  },
]

const server = new Server(
  { name: "print-mail-service", version: "0.1.0" },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name } = request.params

  if (name === "get_pricing") {
    return {
      content: [{ type: "text", text: `Printing and mailing one document costs $${PRICE_USD} USD.` }],
    }
  }

  if (name === "print_and_mail") {
    const parsed = printMailArgs.safeParse(request.params.arguments ?? {})
    if (!parsed.success) {
      return { isError: true, content: [{ type: "text", text: "Invalid arguments." }] }
    }
    if (!isS3Url(parsed.data.fileUrl)) {
      return { isError: true, content: [{ type: "text", text: "File URL must be an S3 URL." }] }
    }

    const result = await getMcpMpp().charge({
      amount: PRICE_USD,
      description: `Print & mail document to ${parsed.data.name}`,
      metadata: { service: "print-mail", mailType: parsed.data.mailType },
    })(extra)

    // 402: throw the challenge so it surfaces as a JSON-RPC error (-32042).
    if (result.status === 402) {
      throw result.challenge
    }

    const { fileUrl, mailType, ...address } = parsed.data
    const mailing = await createMailing({ fileUrl, mailType, address })

    return result.withReceipt({
      content: [{ type: "text", text: JSON.stringify({ success: true, ...mailing }, null, 2) }],
    })
  }

  return { isError: true, content: [{ type: "text", text: `Unknown tool: ${name}` }] }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
