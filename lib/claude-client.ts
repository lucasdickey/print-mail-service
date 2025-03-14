import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface DocumentAnalysisResult {
  category: string;
  summary: string;
  themes: string[];
  entities: string[];
}

/**
 * Analyzes a PDF document using Claude API
 * @param documentName The name of the document
 * @param documentType The type of the document (blog post, academic paper, etc.)
 * @param description The user-provided description of the document
 * @param documentUrl The URL to the PDF document
 * @returns Analysis results including category, summary, themes, and entities
 */
export async function analyzeDocument(
  documentName: string,
  documentType: string,
  description: string,
  documentUrl: string
): Promise<DocumentAnalysisResult> {
  try {
    console.log(`Analyzing document: ${documentName}`);
    
    // Create a prompt for Claude to analyze the document
    const prompt = `
    I need you to analyze a document with the following information:
    
    Document Name: ${documentName}
    Document Type: ${documentType}
    Document Description: ${description}
    Document URL: ${documentUrl}
    
    Please analyze this document and provide the following structured information:
    
    1. Document Category: Assign a high-level category from standard non-fiction and fiction book categories.
    2. Summary: Write a 3-paragraph summary of the document's content.
    3. Key Themes: Identify 3-5 main themes discussed in the document.
    4. Named Entities: List important people, organizations, locations, or other named entities mentioned.
    
    Format your response as JSON with the following structure:
    {
      "category": "string",
      "summary": "string",
      "themes": ["string", "string", "string"],
      "entities": ["string", "string", "string"]
    }
    `;
    
    // Call Claude API
    const message = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    // Parse the response - handle different content types
    let responseText = '';
    
    // Check if the content is an array and extract text content
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if ('type' in block && block.type === 'text' && 'text' in block) {
          responseText += block.text;
        }
      }
    }
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]) as DocumentAnalysisResult;
    console.log('Document analysis completed successfully');
    
    return analysisResult;
  } catch (error) {
    console.error('Error analyzing document with Claude:', error);
    // Return default values in case of error
    return {
      category: 'Uncategorized',
      summary: 'No summary available due to analysis error.',
      themes: ['Unknown'],
      entities: ['Unknown'],
    };
  }
}
