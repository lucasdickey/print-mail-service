# Print Drop Enhancement: Public Document Repository

## Project Overview

Enhance the existing Print Drop service (which allows users to upload PDFs, process payments via Stripe, and mail physical documents via Lob) with a public document repository feature.

## Current Functionality

- PDF document upload
- Payment processing with Stripe
- Physical mail delivery with Lob API
- Order tracking

## New Requirements

### 1. Public vs Private Document Classification

- Add a toggle during upload for users to mark documents as "Public" or "Private" (default)
- Clear warning/notification when selecting "Public" option
- Public documents become available for other users to browse and print
- Private documents are for personal use only

### 2. Document Information Fields

- Add a document name input field
- Add a text description input field (approximately 4 sentences/500 characters) during upload
- Allow uploaders to provide details about their document

### 3. Public Document Browse Interface

- Create a separate browse screen/tab for public documents
- Responsive design that works well on mobile devices
- Include document name, description, print count, and metadata
- Allow users to select a public document for printing and shipping

### 4. Document Analysis with Claude

- After successful upload AND payment completion, analyze public documents with Claude API
- Extract and store the following structured metadata:
  - Document category (use high-level non-fiction and fiction book categories)
  - 3-paragraph summary
  - Key themes discussed
  - Named entities mentioned
- Store all metadata as structured data in the database for search/filtering

### 5. Conceptual Document Relationships

- Implement a system to establish relationships between documents based on:
  - Shared themes
  - Similar categories
  - Named entities
  - Other relevant metadata
- Enable document discovery through these relationships

### 6. Metrics & Leaderboard

- Track print count for each public document
- Create a "Top 50" leaderboard based on print count
- Display print count for each document in the browse interface

### 7. User Attribution

- Collect uploader's name and contact information (from Stripe data)
- Store this information in the backend (not exposed on frontend)
- Associate uploaded documents with the uploader

### 8. Admin Moderation

- Create an admin UI to:
  - View all public documents
  - Unpublish (make private) any document
  - View basic analytics

## Technical Implementation Notes

### Database Schema Updates

- Add `isPublic` boolean field to document table
- Add `documentName` text field to document table
- Add `description` text field to document table
- Add `printCount` counter field to document table
- Create tables for structured metadata (categories, themes, entities)
- Create relationship tables to map connections between documents

### Claude Integration

- Use Claude API to analyze documents after payment completion
- Structure the prompt to extract categories, summary, themes, and entities
- Process and normalize the response for database storage

### User Interface

- Design clear public/private toggle with appropriate warnings
- Add document name and description input fields
- Create intuitive browse interface with filtering options
- Display document metadata and print counts
- Show relationship between documents (e.g., "Similar documents")

### API Endpoints

- Create endpoints for browsing public documents
- Add endpoint for selecting and printing public documents
- Implement admin endpoints for moderation

## Technology Stack

- Continue using the existing stack:
  - Frontend: Next.js, React 18, Tailwind CSS
  - Backend: Convex
  - Storage: AWS S3
  - Payment: Stripe
  - Mail Service: Lob
  - Deployment: Vercel
- Add Claude API integration
- Convex for relational database

## Important Considerations

- Ensure S3 bucket policies are updated to handle public document access
- Implement appropriate rate limiting for Claude API calls
- Consider PDF preview capabilities for the browse interface
- Ensure responsive design works across devices
- Scale database design to support future growth of document relationships
