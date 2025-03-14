import Anthropic from '@anthropic-ai/sdk';
import { ConvexHttpClient } from 'convex/browser';

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

// Valid entity types
const VALID_ENTITY_TYPES = [
  'person',
  'organization',
  'product',
  'company',
  'location',
  'event',
  'book',
  'movie',
  'music',
  'publisher',
  'other'
] as const;

// Valid social media platforms
const VALID_PLATFORMS = [
  'twitter',
  'x',
  'instagram',
  'linkedin',
  'facebook',
  'tiktok',
  'youtube',
  'github',
  'reddit',
  'other'
] as const;

export interface DocumentAnalysisResult {
  category: string;
  summary: string;
  themes: string[];
  entities: Array<{
    type: typeof VALID_ENTITY_TYPES[number];
    name: string;
  }>;
  socialHandles: Array<{
    platform: typeof VALID_PLATFORMS[number];
    handle: string;
    url: string;
  }>;
  readingLevel: string;
  estimatedReadTime: string;
  keyPhrases: string[];
  citations: Array<{
    type: 'book' | 'article' | 'website' | 'journal' | 'other';
    title: string;
    authors?: string[];
    year?: number;
    url?: string;
  }>;
  tableOfContents?: string[];
}

/**
 * Analyzes a PDF document using Claude API with tool use
 * @param documentName The name of the document
 * @param documentType The type of the document (blog post, academic paper, etc.)
 * @param description The user-provided description of the document
 * @param documentUrl The URL to the PDF document
 * @param metadata Optional additional metadata about the document
 * @returns Analysis results including category, summary, themes, entities, and social handles
 */
export async function analyzeDocument(
  documentName: string,
  documentType: string,
  description: string,
  documentUrl: string,
  metadata?: {
    language?: string;
    publicationYear?: number;
    targetAudience?: string;
    contentRating?: string;
    tags?: string;
    isOriginalWork?: boolean;
    uploaderName?: string;
  }
): Promise<DocumentAnalysisResult> {
  try {
    console.log(`Analyzing document: ${documentName}`);
    
    // Get categories from database
    let categoriesPrompt = '';
    try {
      // Bypass TypeScript checking for Convex function calls
      // @ts-ignore - Convex HTTP client accepts string function paths
      const categoriesResponse = await convex.query("categories:getCategoriesForPrompt", {});
      categoriesPrompt = categoriesResponse || '';
    } catch (error) {
      console.error('Error fetching categories:', error);
      categoriesPrompt = 'Academic, Business, Creative Writing, Technical, Legal, Medical, Educational, News, Personal, Reference, Science, Social, Other';
    }
    
    // Create a prompt for Claude to analyze the document using tool use
    const systemPrompt = `
    You are a document analysis assistant that extracts structured information from documents.
    You will analyze the document and extract specific information using the tools provided.
    
    For entity types, only use these predefined types: ${VALID_ENTITY_TYPES.join(', ')}
    For social media platforms, only use these predefined platforms: ${VALID_PLATFORMS.join(', ')}
    
    For document categories, use one of these predefined categories:
    ${categoriesPrompt}
    `;
    
    // Build metadata section with any available metadata
    let metadataSection = '';
    if (metadata) {
      metadataSection = `
      Additional Metadata:
      ${metadata.language ? `Language: ${metadata.language}` : ''}
      ${metadata.publicationYear ? `Publication Year: ${metadata.publicationYear}` : ''}
      ${metadata.targetAudience ? `Target Audience: ${metadata.targetAudience}` : ''}
      ${metadata.contentRating ? `Content Rating: ${metadata.contentRating}` : ''}
      ${metadata.tags ? `Tags: ${metadata.tags}` : ''}
      ${metadata.isOriginalWork !== undefined ? `Original Work: ${metadata.isOriginalWork ? 'Yes' : 'No'}` : ''}
      ${metadata.uploaderName ? `Uploader: ${metadata.uploaderName}` : ''}
      `;
    }
    
    const userPrompt = `
    Please analyze this document with the following information:
    
    Document Name: ${documentName}
    Document Type: ${documentType}
    Document Description: ${description}
    Document URL: ${documentUrl}
    ${metadataSection}
    
    Extract the following information and format your response as JSON:
    1. Category: Assign ONE category from the predefined list
    2. Summary: Write a 3-paragraph summary
    3. Themes: Identify 3-5 main themes
    4. Entities: Extract important entities, using ONLY the predefined entity types
    5. Social Handles: Extract any social media handles and format as proper URLs
    6. Reading Level: Determine the approximate reading level (Elementary, Middle School, High School, College, Graduate, Technical)
    7. Estimated Read Time: How long would it take an average reader to read this document
    8. Key Phrases: 5-10 key phrases that represent core concepts
    9. Citations: Extract any references or citations
    10. Table of Contents: Extract or generate a table of contents
    
    Format your response as a valid JSON object with these fields:
    {
      "category": "string",
      "summary": "string",
      "themes": ["string"],
      "entities": [{"type": "string", "name": "string"}],
      "socialHandles": [{"platform": "string", "handle": "string", "url": "string"}],
      "readingLevel": "string",
      "estimatedReadTime": "string",
      "keyPhrases": ["string"],
      "citations": [{"type": "string", "title": "string", "authors": ["string"], "year": number, "url": "string"}],
      "tableOfContents": ["string"]
    }
    `;
    
    // Call Claude API
    const message = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });
    
    // Parse the response
    let responseText = '';
    
    // Extract text content from the response
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if ('type' in block && block.type === 'text' && 'text' in block) {
          responseText += block.text;
        }
      }
    }
    
    // Initialize result object with default values
    const defaultResult: DocumentAnalysisResult = {
      category: 'Uncategorized',
      summary: 'No summary available.',
      themes: [],
      entities: [],
      socialHandles: [],
      readingLevel: 'Not determined',
      estimatedReadTime: 'Unknown',
      keyPhrases: [],
      citations: []
    };
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Claude response');
      return defaultResult;
    }
    
    try {
      const parsedResult = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the result
      const analysisResult: DocumentAnalysisResult = {
        ...defaultResult,
        ...parsedResult
      };
      
      // Validate entity types
      if (Array.isArray(analysisResult.entities)) {
        analysisResult.entities = analysisResult.entities.map(entity => ({
          type: VALID_ENTITY_TYPES.includes(entity.type as any) ? entity.type : 'other',
          name: entity.name || 'Unknown'
        }));
      }
      
      // Validate social media platforms
      if (Array.isArray(analysisResult.socialHandles)) {
        analysisResult.socialHandles = analysisResult.socialHandles.map(handle => ({
          platform: VALID_PLATFORMS.includes(handle.platform as any) ? handle.platform : 'other',
          handle: handle.handle || '',
          url: handle.url || ''
        }));
      }
      
      console.log('Document analysis completed successfully');
      return analysisResult;
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return defaultResult;
    }
  } catch (error) {
    console.error('Error analyzing document with Claude:', error);
    // Return default values in case of error
    return {
      category: 'Uncategorized',
      summary: 'No summary available due to analysis error.',
      themes: ['Unknown'],
      entities: [{ type: 'other', name: 'Unknown' }],
      socialHandles: [],
      readingLevel: 'Not determined',
      estimatedReadTime: 'Unknown',
      keyPhrases: [],
      citations: []
    };
  }
}
