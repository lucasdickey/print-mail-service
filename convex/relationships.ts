import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a relationship between two documents
export const createRelationship = mutation({
  args: {
    sourceDocumentId: v.id("documents"),
    relatedDocumentId: v.id("documents"),
    relationshipType: v.string(),
    relationshipValue: v.string(),
    strength: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if relationship already exists
    const existingRelationships = await ctx.db
      .query("documentRelationships")
      .filter((q) => 
        q.and(
          q.eq(q.field("sourceDocumentId"), args.sourceDocumentId),
          q.eq(q.field("relatedDocumentId"), args.relatedDocumentId),
          q.eq(q.field("relationshipType"), args.relationshipType),
          q.eq(q.field("relationshipValue"), args.relationshipValue)
        )
      )
      .collect();
    
    // If relationship exists, update the strength
    if (existingRelationships.length > 0) {
      await ctx.db.patch(existingRelationships[0]._id, {
        strength: args.strength,
      });
      return existingRelationships[0]._id;
    }
    
    // Otherwise create a new relationship
    return await ctx.db.insert("documentRelationships", {
      sourceDocumentId: args.sourceDocumentId,
      relatedDocumentId: args.relatedDocumentId,
      relationshipType: args.relationshipType,
      relationshipValue: args.relationshipValue,
      strength: args.strength,
    });
  },
});

// Get related documents for a given document
export const getRelatedDocuments = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // Get all relationships where this document is the source
    const relationships = await ctx.db
      .query("documentRelationships")
      .filter((q) => q.eq(q.field("sourceDocumentId"), args.documentId))
      .order("desc")
      .collect();
    
    // Get the related documents
    const relatedDocumentIds = relationships.map(rel => rel.relatedDocumentId);
    const relatedDocuments = [];
    
    for (const id of relatedDocumentIds) {
      const doc = await ctx.db.get(id);
      if (doc && doc.isPublic) {
        // Find the relationship for this document
        const relationship = relationships.find(rel => rel.relatedDocumentId === id);
        
        relatedDocuments.push({
          ...doc,
          relationshipType: relationship?.relationshipType,
          relationshipValue: relationship?.relationshipValue,
          relationshipStrength: relationship?.strength,
        });
      }
    }
    
    return relatedDocuments;
  },
});

// Get documents related by a specific theme
export const getDocumentsByTheme = query({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    // Get all relationships with this theme
    const relationships = await ctx.db
      .query("documentRelationships")
      .filter((q) => 
        q.and(
          q.eq(q.field("relationshipType"), "theme"),
          q.eq(q.field("relationshipValue"), args.theme)
        )
      )
      .collect();
    
    // Get unique document IDs from both source and related
    const documentIds = new Set([
      ...relationships.map(rel => rel.sourceDocumentId),
      ...relationships.map(rel => rel.relatedDocumentId)
    ]);
    
    // Get the documents
    const documents = [];
    for (const id of documentIds) {
      const doc = await ctx.db.get(id);
      if (doc && doc.isPublic) {
        documents.push(doc);
      }
    }
    
    return documents;
  },
});
