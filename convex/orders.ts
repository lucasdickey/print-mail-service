import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new order
export const createOrder = mutation({
  args: {
    documentId: v.id("documents"),
    trackingId: v.string(),
    mailType: v.string(),
    price: v.number(),
    recipientName: v.string(),
    recipientCompany: v.optional(v.string()),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    addressCity: v.string(),
    addressState: v.string(),
    addressZip: v.string(),
    addressCountry: v.string(),
    expectedDeliveryDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the order
    const orderId = await ctx.db.insert("orders", {
      documentId: args.documentId,
      trackingId: args.trackingId,
      mailType: args.mailType,
      price: args.price,
      recipientName: args.recipientName,
      recipientCompany: args.recipientCompany,
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      addressCity: args.addressCity,
      addressState: args.addressState,
      addressZip: args.addressZip,
      addressCountry: args.addressCountry,
      status: "created",
      createdAt: Date.now(),
      expectedDeliveryDate: args.expectedDeliveryDate,
    });
    
    // Increment the print count for the document
    const document = await ctx.db.get(args.documentId);
    if (document) {
      await ctx.db.patch(args.documentId, {
        printCount: (document.printCount || 0) + 1,
      });
    }
    
    return orderId;
  },
});

// Get all orders
export const getOrders = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .order("desc")
      .collect();
  },
});

// Get order by ID
export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
    });
    
    return args.orderId;
  },
});
