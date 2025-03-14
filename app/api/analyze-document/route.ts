import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { analyzeDocument } from '@/lib/claude-client';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export async function POST(req: NextRequest) {
  try {
    const { documentId, documentName, documentType, description, fileUrl } = await req.json();

    if (!documentId || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Analyze the document using Claude
    const analysisResult = await analyzeDocument(
      documentName,
      documentType,
      description,
      fileUrl
    );

    if (!analysisResult) {
      return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
    }

    // Update the document with analysis results
    try {
      // Use the updateDocumentAnalysis mutation from the API
      // Fix TypeScript error by explicitly typing the API
      await convex.mutation<typeof api.documents.updateDocumentAnalysis>(
        "documents:updateDocumentAnalysis", 
        {
          documentId,
          category: analysisResult.category,
          summary: analysisResult.summary,
          themes: analysisResult.themes,
          entities: analysisResult.entities,
          analyzed: true
        }
      );

      return NextResponse.json({ success: true, analysisResult });
    } catch (dbError) {
      console.error('Error updating document with analysis:', dbError);
      return NextResponse.json({ error: 'Failed to update document with analysis' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in analyze-document API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
