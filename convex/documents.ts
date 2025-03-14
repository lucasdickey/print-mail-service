import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new document
export const createDocument = mutation({
  args: {
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    isPublic: v.boolean(),
    documentName: v.string(),
    description: v.string(),
    documentType: v.string(),
    ownershipStatus: v.string(),
    // Additional metadata fields
    tags: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
    publicationYear: v.optional(v.number()),
    targetAudience: v.optional(v.string()),
    contentRating: v.optional(v.string()),
    isOriginalWork: v.optional(v.boolean()),
    // User information
    uploaderName: v.optional(v.string()),
    uploaderEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      isPublic: args.isPublic,
      documentName: args.documentName,
      description: args.description,
      documentType: args.documentType,
      ownershipStatus: args.ownershipStatus,
      // Additional metadata fields
      tags: args.tags || [],
      language: args.language,
      publicationYear: args.publicationYear,
      targetAudience: args.targetAudience,
      contentRating: args.contentRating,
      isOriginalWork: args.isOriginalWork,
      // User engagement metrics
      viewCount: 0,
      downloadCount: 0,
      averageRating: 0,
      flagCount: 0,
      // User information
      uploaderName: args.uploaderName,
      uploaderEmail: args.uploaderEmail,
      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Analysis status
      analyzed: false,
      printCount: 0,
    });
    
    return documentId;
  },
});

// Get a document by ID
export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Get all public documents
export const listPublicDocuments = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();
  },
});

// Get top public documents by print count
export const getTopDocuments = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(args.limit);
  },
});

// Increment the print count for a document
export const incrementPrintCount = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    await ctx.db.patch(args.documentId, {
      printCount: (document.printCount || 0) + 1,
      updatedAt: Date.now(),
    });
    
    return document.printCount + 1;
  },
});

// Increment the view count for a document
export const incrementViewCount = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    await ctx.db.patch(args.documentId, {
      viewCount: (document.viewCount || 0) + 1,
      updatedAt: Date.now(),
    });
    
    return document.viewCount + 1;
  },
});

// Increment the download count for a document
export const incrementDownloadCount = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    await ctx.db.patch(args.documentId, {
      downloadCount: (document.downloadCount || 0) + 1,
      updatedAt: Date.now(),
    });
    
    return document.downloadCount + 1;
  },
});

// Update document metadata after Claude analysis
export const updateDocumentAnalysis = mutation({
  args: {
    documentId: v.id("documents"),
    category: v.string(),
    summary: v.string(),
    themes: v.array(v.string()),
    entities: v.array(v.object({
      type: v.string(),
      name: v.string(),
    })),
    socialHandles: v.optional(v.array(v.object({
      platform: v.string(),
      handle: v.string(),
      url: v.string(),
    }))),
    readingLevel: v.optional(v.string()),
    estimatedReadTime: v.optional(v.string()),
    keyPhrases: v.optional(v.array(v.string())),
    citations: v.optional(v.array(v.object({
      type: v.string(),
      title: v.string(),
      authors: v.optional(v.array(v.string())),
      year: v.optional(v.number()),
      url: v.optional(v.string()),
    }))),
    tableOfContents: v.optional(v.array(v.string())),
    analyzed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      category: args.category,
      summary: args.summary,
      themes: args.themes,
      entities: args.entities,
      socialHandles: args.socialHandles || [],
      readingLevel: args.readingLevel,
      estimatedReadTime: args.estimatedReadTime,
      keyPhrases: args.keyPhrases,
      citations: args.citations,
      tableOfContents: args.tableOfContents,
      analyzed: args.analyzed ?? true,
      updatedAt: Date.now(),
    });
    
    return args.documentId;
  },
});

// Admin: Update document public status
export const updateDocumentPublicStatus = mutation({
  args: {
    documentId: v.id("documents"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      isPublic: args.isPublic,
      updatedAt: Date.now(),
    });
    
    return args.documentId;
  },
});

// Filter public documents by category
export const getDocumentsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("category"), args.category)
        )
      )
      .order("desc")
      .collect();
  },
});

// Filter public documents by type
export const getDocumentsByType = query({
  args: { documentType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("documentType"), args.documentType)
        )
      )
      .order("desc")
      .collect();
  },
});

// Filter public documents by tag
export const getDocumentsByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    // Get all public documents first
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    // Then filter by tag
    return documents.filter(doc => 
      doc.tags && Array.isArray(doc.tags) && doc.tags.includes(args.tag)
    );
  },
});

// Filter public documents by language
export const getDocumentsByLanguage = query({
  args: { language: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("language"), args.language)
        )
      )
      .order("desc")
      .collect();
  },
});

// Filter public documents by target audience
export const getDocumentsByTargetAudience = query({
  args: { targetAudience: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("targetAudience"), args.targetAudience)
        )
      )
      .order("desc")
      .collect();
  },
});

// Filter public documents by content rating
export const getDocumentsByContentRating = query({
  args: { contentRating: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("contentRating"), args.contentRating)
        )
      )
      .order("desc")
      .collect();
  },
});

// Filter public documents by publication year
export const getDocumentsByPublicationYear = query({
  args: { publicationYear: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("publicationYear"), args.publicationYear)
        )
      )
      .order("desc")
      .collect();
  },
});

// Filter public documents by ownership status
export const getDocumentsByOwnershipStatus = query({
  args: { ownershipStatus: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("ownershipStatus"), args.ownershipStatus)
        )
      )
      .order("desc")
      .collect();
  },
});

// Get most viewed public documents
export const getMostViewedDocuments = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    // Sort by view count and take the top N
    return documents
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, args.limit);
  },
});

// Get most downloaded public documents
export const getMostDownloadedDocuments = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    // Sort by download count and take the top N
    return documents
      .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
      .slice(0, args.limit);
  },
});

// Get highest rated public documents
export const getHighestRatedDocuments = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    // Sort by average rating and take the top N
    return documents
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, args.limit);
  },
});

// Search public documents
export const searchPublicDocuments = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const searchTermLower = args.searchTerm.toLowerCase();
    
    // Get all public documents
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    // Filter documents that match the search term in various fields
    return documents.filter(doc => 
      doc.documentName.toLowerCase().includes(searchTermLower) ||
      doc.description.toLowerCase().includes(searchTermLower) ||
      (doc.category && doc.category.toLowerCase().includes(searchTermLower)) ||
      (doc.documentType && doc.documentType.toLowerCase().includes(searchTermLower)) ||
      (doc.language && doc.language.toLowerCase().includes(searchTermLower)) ||
      (doc.targetAudience && doc.targetAudience.toLowerCase().includes(searchTermLower)) ||
      (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTermLower))) ||
      (doc.themes && doc.themes.some((theme: string) => theme.toLowerCase().includes(searchTermLower))) ||
      (doc.entities && doc.entities.some((entity: string) => entity.toLowerCase().includes(searchTermLower)))
    );
  },
});

// Flag a document for moderation
export const flagDocument = mutation({
  args: {
    documentId: v.id("documents"),
    reason: v.string(),
    description: v.optional(v.string()),
    flaggedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if document exists
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Create a new flag entry in moderation table
    await ctx.db.insert("moderation", {
      documentId: args.documentId,
      reason: args.reason,
      description: args.description,
      flaggedBy: args.flaggedBy,
      status: "pending",
      createdAt: Date.now(),
    });

    // Increment the flag count on the document
    const currentFlagCount = document.flagCount || 0;
    await ctx.db.patch(args.documentId, {
      flagCount: currentFlagCount + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all flags for a document
export const getDocumentFlags = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderation")
      .filter((q) => q.eq(q.field("documentId"), args.documentId))
      .collect();
  },
});

// Get all pending moderation flags
export const getPendingFlags = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("moderation")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// Review a flagged document
export const reviewFlag = mutation({
  args: {
    flagId: v.id("moderation"),
    status: v.string(), // "accepted" or "rejected"
    reviewedBy: v.string(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const flag = await ctx.db.get(args.flagId);
    if (!flag) {
      throw new Error("Flag not found");
    }

    // Update the flag status
    await ctx.db.patch(args.flagId, {
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewNotes: args.reviewNotes,
      updatedAt: Date.now(),
      resolvedAt: Date.now(),
    });

    // If the flag is accepted, we might want to take additional actions
    // like removing the document from public access
    if (args.status === "accepted") {
      await ctx.db.patch(flag.documentId, {
        isPublic: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get flagged documents with count above threshold
export const getHighlyFlaggedDocuments = query({
  args: {
    threshold: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.gte(q.field("flagCount"), args.threshold),
          q.eq(q.field("isPublic"), true)
        )
      )
      .collect();
  },
});
