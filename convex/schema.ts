import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Documents table to store uploaded documents
  documents: defineTable({
    // Basic document information
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    
    // New fields for public repository
    isPublic: v.boolean(),
    documentName: v.string(),
    description: v.string(),
    printCount: v.number(),
    
    // Document type and ownership
    documentType: v.string(), // blog post, academic white paper, sales case study, poem, speech, transcribed podcast, etc.
    ownershipStatus: v.string(), // "I originated and own this document", "I'm part of a team that originated and own this document", 
                                 // "I'm a company that owns this document", "I do not own this document", "This document is in public domain"
    
    // Additional metadata for search and discovery
    tags: v.optional(v.array(v.string())), // User-defined tags for categorization
    language: v.optional(v.string()), // Document language (e.g., "English", "Spanish")
    publicationYear: v.optional(v.number()), // Year the document was originally published
    targetAudience: v.optional(v.string()), // Intended audience (e.g., "General", "Academic", "Professional")
    contentRating: v.optional(v.string()), // Content rating (e.g., "General", "Mature", "Academic")
    isOriginalWork: v.optional(v.boolean()), // Whether this is an original work or a reproduction
    
    // User engagement metrics
    viewCount: v.optional(v.number()), // Number of times the document has been viewed
    downloadCount: v.optional(v.number()), // Number of times the document has been downloaded
    averageRating: v.optional(v.number()), // Average user rating (if implemented)
    flagCount: v.optional(v.number()), // Count of flags on this document
    
    // User information
    uploaderName: v.optional(v.string()),
    uploaderEmail: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    
    // Claude analysis results
    analyzed: v.optional(v.boolean()),
    category: v.optional(v.string()),
    summary: v.optional(v.string()),
    themes: v.optional(v.array(v.string())),
    entities: v.optional(v.array(v.string())),
  }),
  
  // Orders table to track document orders
  orders: defineTable({
    documentId: v.id("documents"),
    trackingId: v.string(),
    mailType: v.string(),
    price: v.number(),
    
    // Address information
    recipientName: v.string(),
    recipientCompany: v.optional(v.string()),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    addressCity: v.string(),
    addressState: v.string(),
    addressZip: v.string(),
    addressCountry: v.string(),
    
    // Status and timestamps
    status: v.string(),
    createdAt: v.number(),
    expectedDeliveryDate: v.optional(v.string()),
  }),
  
  // Document relationships
  documentRelationships: defineTable({
    sourceDocumentId: v.id("documents"),
    relatedDocumentId: v.id("documents"),
    relationshipType: v.string(), // "theme", "category", "entity"
    relationshipValue: v.string(), // The actual theme, category, or entity name
    strength: v.number(), // A score from 0-1 indicating relationship strength
  }),
  
  // User ratings and reviews
  documentRatings: defineTable({
    documentId: v.id("documents"),
    userId: v.optional(v.string()), // Can be anonymous
    rating: v.number(), // 1-5 star rating
    review: v.optional(v.string()), // Optional text review
    createdAt: v.number(),
  }),
  
  // Moderation table for document flags
  moderation: defineTable({
    documentId: v.id("documents"),
    flaggedBy: v.optional(v.string()), // User email or ID who flagged the document
    reason: v.string(), // Reason for flagging (e.g., "hate speech", "copyright violation", etc.)
    description: v.optional(v.string()), // Additional details provided by the flagger
    status: v.string(), // Status of the flag: "pending", "reviewed", "rejected", "accepted"
    reviewedBy: v.optional(v.string()), // Admin who reviewed the flag
    reviewNotes: v.optional(v.string()), // Notes from the review
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
  }),
});
