import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Initial set of document categories
const initialCategories = [
  { name: "Academic", description: "Scholarly articles, research papers, and academic publications" },
  { name: "Business", description: "Business documents, case studies, and professional reports" },
  { name: "Creative Writing", description: "Fiction, poetry, and creative non-fiction" },
  { name: "Technical", description: "Technical documentation, manuals, and guides" },
  { name: "Legal", description: "Legal documents, contracts, and agreements" },
  { name: "Medical", description: "Medical research, health documents, and patient information" },
  { name: "Educational", description: "Educational materials, lesson plans, and learning resources" },
  { name: "News", description: "News articles, journalistic pieces, and current events" },
  { name: "Personal", description: "Personal documents, letters, and journals" },
  { name: "Reference", description: "Reference materials, encyclopedic content, and guides" },
  { name: "Science", description: "Scientific papers, research, and publications" },
  { name: "Social", description: "Social media content, blog posts, and online discussions" },
  { name: "Other", description: "Documents that don't fit into other categories" }
];

// Type for category document
type CategoryDoc = {
  name: string;
  description?: string;
  parentCategory?: Id<"documentCategories">;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentCategory: v.optional(v.id("documentCategories")),
  },
  handler: async (ctx, args) => {
    // Check if category with the same name already exists
    const existingCategory = await ctx.db
      .query("documentCategories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (existingCategory) {
      throw new Error(`Category with name "${args.name}" already exists`);
    }
    
    // Create the new category
    const categoryId = await ctx.db.insert("documentCategories", {
      name: args.name,
      description: args.description,
      parentCategory: args.parentCategory,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return categoryId;
  },
});

// Get all categories
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("documentCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get a category by ID
export const getCategory = query({
  args: {
    categoryId: v.id("documentCategories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  },
});

// Update a category
export const updateCategory = mutation({
  args: {
    categoryId: v.id("documentCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    parentCategory: v.optional(v.id("documentCategories")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    
    // If name is being updated, check for duplicates
    if (args.name && args.name !== category.name) {
      const existingCategory = await ctx.db
        .query("documentCategories")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .first();
      
      if (existingCategory) {
        throw new Error(`Category with name "${args.name}" already exists`);
      }
    }
    
    // Update the category
    await ctx.db.patch(args.categoryId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.parentCategory !== undefined && { parentCategory: args.parentCategory }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      updatedAt: Date.now(),
    });
    
    return args.categoryId;
  },
});

// Delete a category (soft delete by setting isActive to false)
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("documentCategories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    
    await ctx.db.patch(args.categoryId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    
    return args.categoryId;
  },
});

// Initialize default categories if none exist
export const initializeDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if categories already exist
    const existingCategories = await ctx.db
      .query("documentCategories")
      .take(1);
    
    if (existingCategories.length > 0) {
      return { message: "Categories already initialized" };
    }
    
    // Insert initial categories
    const categoryIds: Id<"documentCategories">[] = [];
    for (const category of initialCategories) {
      const categoryId = await ctx.db.insert("documentCategories", {
        name: category.name,
        description: category.description,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      categoryIds.push(categoryId);
    }
    
    return { message: "Categories initialized successfully", count: categoryIds.length };
  },
});

// Get categories as a formatted list for Claude prompt
export const getCategoriesForPrompt = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("documentCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Format categories for the prompt
    const formattedCategories = categories.map(cat => `"${cat.name}": ${cat.description || ""}`);
    return formattedCategories.join('\n');
  },
});
