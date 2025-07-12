/**
 * Document Download API
 * Handles downloading of generated PDF documents
 * Supports access control, streaming, and secure file delivery
 */

import { NextRequest, NextResponse } from 'next/server';

// Types for document download
interface DocumentMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  generatedAt: string;
  expiresAt: string;
  accessCount: number;
  maxAccess?: number;
  itineraryId: string;
  userId?: string;
}

/**
 * GET /api/documents/[id]
 * Download a specific document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing document ID' },
        { status: 400 }
      );
    }

    // Check if requesting download or metadata
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const inline = searchParams.get('inline') === 'true';

    if (action === 'metadata') {
      const metadata = await getDocumentMetadata(documentId);
      return NextResponse.json(metadata);
    }

    // Get document from storage
    const documentData = await getDocumentFromStorage(documentId);
    
    if (!documentData) {
      return NextResponse.json(
        { error: 'Document not found or expired' },
        { status: 404 }
      );
    }

    // Validate access permissions
    const accessResult = await validateDocumentAccess(documentId, request);
    if (!accessResult.allowed) {
      return NextResponse.json(
        { error: accessResult.reason },
        { status: accessResult.status }
      );
    }

    // Update access count
    await incrementAccessCount(documentId);

    // Prepare response headers
    const headers = new Headers();
    headers.set('Content-Type', documentData.metadata.mimeType);
    headers.set('Content-Length', documentData.buffer.length.toString());
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Set content disposition based on inline parameter
    if (inline) {
      headers.set('Content-Disposition', `inline; filename="${documentData.metadata.fileName}"`);
    } else {
      headers.set('Content-Disposition', `attachment; filename="${documentData.metadata.fileName}"`);
    }

    // Add security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Download-Options', 'noopen');

    return new NextResponse(documentData.buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[id]
 * Update document metadata or regenerate document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const body = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing document ID' },
        { status: 400 }
      );
    }

    // Handle different actions
    const action = body.action;

    switch (action) {
      case 'extend_expiry':
        const newExpiry = await extendDocumentExpiry(documentId, body.days || 7);
        return NextResponse.json({
          success: true,
          newExpiryDate: newExpiry,
          message: 'Document expiry extended successfully'
        });

      case 'regenerate':
        const regeneratedDoc = await regenerateDocument(documentId, body.options);
        return NextResponse.json({
          success: true,
          documentId: regeneratedDoc.id,
          downloadUrl: regeneratedDoc.downloadUrl,
          message: 'Document regenerated successfully'
        });

      case 'share':
        const shareInfo = await createDocumentShareLink(documentId, body.permissions);
        return NextResponse.json({
          success: true,
          shareUrl: shareInfo.url,
          expiresAt: shareInfo.expiresAt,
          message: 'Share link created successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Document operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform document operation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing document ID' },
        { status: 400 }
      );
    }

    // Validate deletion permissions
    const accessResult = await validateDocumentAccess(documentId, request);
    if (!accessResult.allowed) {
      return NextResponse.json(
        { error: accessResult.reason },
        { status: accessResult.status }
      );
    }

    // Delete document from storage
    const deleted = await deleteDocumentFromStorage(documentId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

/**
 * Get document from storage
 */
async function getDocumentFromStorage(documentId: string): Promise<{
  buffer: Buffer;
  metadata: DocumentMetadata;
} | null> {
  
  // Check global cache first (for Phase 5 demo)
  const pdfCache = global.pdfCache || new Map();
  const cachedBuffer = pdfCache.get(documentId);
  
  if (!cachedBuffer) {
    return null;
  }

  // Get metadata (in production, this would come from database)
  const metadata = await getDocumentMetadata(documentId);
  
  if (!metadata) {
    return null;
  }

  // Check if document has expired
  if (new Date() > new Date(metadata.expiresAt)) {
    // Remove expired document
    pdfCache.delete(documentId);
    return null;
  }

  return {
    buffer: cachedBuffer,
    metadata
  };
}

/**
 * Get document metadata
 */
async function getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
  // Mock metadata for Phase 5 demo
  // In production, this would fetch from database
  
  const mockMetadata: DocumentMetadata = {
    id: documentId,
    fileName: `travel-itinerary-${documentId.split('_')[1]}.pdf`,
    fileSize: 245760, // ~240KB
    mimeType: 'application/pdf',
    generatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    accessCount: 0,
    maxAccess: 100,
    itineraryId: 'itinerary_123',
    userId: 'user_456'
  };

  return mockMetadata;
}

/**
 * Validate document access permissions
 */
async function validateDocumentAccess(documentId: string, request: NextRequest): Promise<{
  allowed: boolean;
  reason?: string;
  status: number;
}> {
  
  // Get document metadata
  const metadata = await getDocumentMetadata(documentId);
  
  if (!metadata) {
    return {
      allowed: false,
      reason: 'Document not found',
      status: 404
    };
  }

  // Check expiration
  if (new Date() > new Date(metadata.expiresAt)) {
    return {
      allowed: false,
      reason: 'Document has expired',
      status: 410
    };
  }

  // Check access limits
  if (metadata.maxAccess && metadata.accessCount >= metadata.maxAccess) {
    return {
      allowed: false,
      reason: 'Download limit exceeded',
      status: 429
    };
  }

  // In production, add additional access controls:
  // - User authentication
  // - Ownership verification
  // - Rate limiting
  // - IP restrictions

  return {
    allowed: true,
    status: 200
  };
}

/**
 * Increment document access count
 */
async function incrementAccessCount(documentId: string): Promise<void> {
  // In production, update database record
  console.log(`Incrementing access count for document: ${documentId}`);
}

/**
 * Extend document expiry
 */
async function extendDocumentExpiry(documentId: string, days: number): Promise<string> {
  const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  // In production, update database record
  console.log(`Extending expiry for document ${documentId} to ${newExpiry.toISOString()}`);
  
  return newExpiry.toISOString();
}

/**
 * Regenerate document with new options
 */
async function regenerateDocument(documentId: string, options: any): Promise<{
  id: string;
  downloadUrl: string;
}> {
  
  // Get original document metadata
  const metadata = await getDocumentMetadata(documentId);
  
  if (!metadata) {
    throw new Error('Original document not found');
  }

  // Create new document ID
  const newDocumentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In production, trigger document regeneration with new options
  console.log(`Regenerating document ${documentId} as ${newDocumentId} with options:`, options);
  
  return {
    id: newDocumentId,
    downloadUrl: `/api/documents/${newDocumentId}`
  };
}

/**
 * Create document share link
 */
async function createDocumentShareLink(documentId: string, permissions: any): Promise<{
  url: string;
  expiresAt: string;
}> {
  
  const shareToken = generateShareToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
  
  // In production, store share link in database with permissions
  console.log(`Creating share link for document ${documentId} with token ${shareToken}`);
  
  return {
    url: `/api/documents/${documentId}?share=${shareToken}`,
    expiresAt
  };
}

/**
 * Delete document from storage
 */
async function deleteDocumentFromStorage(documentId: string): Promise<boolean> {
  // Remove from cache
  const pdfCache = global.pdfCache || new Map();
  const existed = pdfCache.has(documentId);
  
  if (existed) {
    pdfCache.delete(documentId);
  }

  // In production, delete from cloud storage and database
  console.log(`Deleted document ${documentId} from storage`);
  
  return existed;
}

/**
 * Utility functions
 */
function generateShareToken(): string {
  return Math.random().toString(36).substr(2, 16);
}

/**
 * HEAD /api/documents/[id]
 * Get document metadata without downloading
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    
    const documentData = await getDocumentFromStorage(documentId);
    
    if (!documentData) {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', documentData.metadata.mimeType);
    headers.set('Content-Length', documentData.buffer.length.toString());
    headers.set('Last-Modified', new Date(documentData.metadata.generatedAt).toUTCString());
    headers.set('Cache-Control', 'private, no-cache');

    return new NextResponse(null, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Document head error:', error);
    return new NextResponse(null, { status: 500 });
  }
} 