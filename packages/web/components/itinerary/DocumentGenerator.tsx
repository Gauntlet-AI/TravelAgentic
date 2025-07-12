/**
 * Document Generator Component
 * Provides PDF generation functionality using React-PDF
 * Supports various document types, customization options, and real-time generation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Share2, 
  Eye, 
  Settings,
  Calendar,
  MapPin,
  Printer,
  Mail,
  Link,
  Copy
} from 'lucide-react';

// Types for document generation
interface DocumentGeneratorProps {
  itineraryId: string;
  finalizationId?: string;
  itineraryData?: any;
  onDocumentGenerated?: (document: GeneratedDocument) => void;
  onError?: (error: string) => void;
  showPreview?: boolean;
}

interface GeneratedDocument {
  documentId: string;
  downloadUrl: string;
  fileSize: number;
  pageCount: number;
  generatedAt: string;
  expiresAt: string;
  metadata: {
    documentType: string;
    itineraryId: string;
    language: string;
    currency: string;
  };
}

interface DocumentOptions {
  documentType: 'complete' | 'summary' | 'vouchers' | 'confirmations';
  format: {
    includeQRCodes: boolean;
    includeMaps: boolean;
    includePhotos: boolean;
    language: string;
    currency: string;
  };
  branding: {
    logoUrl?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

interface ShareOptions {
  email?: string;
  phoneNumber?: string;
  socialMedia?: string[];
  expirationDays?: number;
}

/**
 * Main DocumentGenerator component
 */
export default function DocumentGenerator({
  itineraryId,
  finalizationId,
  itineraryData,
  onDocumentGenerated,
  onError,
  showPreview = false
}: DocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documentOptions, setDocumentOptions] = useState<DocumentOptions>({
    documentType: 'complete',
    format: {
      includeQRCodes: true,
      includeMaps: false,
      includePhotos: false,
      language: 'en',
      currency: 'USD'
    },
    branding: {
      companyName: 'TravelAgentic'
    }
  });
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    expirationDays: 7
  });
  const [showShareDialog, setShowShareDialog] = useState(false);

  /**
   * Generate PDF document
   */
  const generateDocument = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itineraryId,
          finalizationId,
          ...documentOptions
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const document = await response.json();
      setGenerationProgress(100);
      setGeneratedDocument(document);

      // Notify parent component
      if (onDocumentGenerated) {
        onDocumentGenerated(document);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
      
      // Reset progress after a delay
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  /**
   * Download generated document
   */
  const downloadDocument = () => {
    if (generatedDocument) {
      window.open(generatedDocument.downloadUrl, '_blank');
    }
  };

  /**
   * Preview document
   */
  const previewDocument = () => {
    if (generatedDocument) {
      window.open(`${generatedDocument.downloadUrl}?inline=true`, '_blank');
    }
  };

  /**
   * Share document
   */
  const shareDocument = async (method: string) => {
    if (!generatedDocument) return;

    try {
      switch (method) {
        case 'email':
          if (shareOptions.email) {
            const response = await fetch('/api/documents/share', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documentId: generatedDocument.documentId,
                method: 'email',
                recipient: shareOptions.email,
                expirationDays: shareOptions.expirationDays
              })
            });
            
            if (response.ok) {
              alert('Document shared via email successfully!');
            }
          }
          break;
          
        case 'link':
          const shareUrl = `${window.location.origin}${generatedDocument.downloadUrl}`;
          await navigator.clipboard.writeText(shareUrl);
          alert('Share link copied to clipboard!');
          break;
          
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=Check out my travel itinerary: ${encodeURIComponent(generatedDocument.downloadUrl)}`;
          window.open(whatsappUrl, '_blank');
          break;
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Failed to share document');
    }
  };

  /**
   * Update document options
   */
  const updateDocumentOptions = (updates: Partial<DocumentOptions>) => {
    setDocumentOptions(prev => ({
      ...prev,
      ...updates,
      format: { ...prev.format, ...updates.format },
      branding: { ...prev.branding, ...updates.branding }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Document Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select 
                value={documentOptions.documentType}
                onValueChange={(value) => updateDocumentOptions({ 
                  documentType: value as any 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete Itinerary</SelectItem>
                  <SelectItem value="summary">Trip Summary</SelectItem>
                  <SelectItem value="vouchers">Vouchers Only</SelectItem>
                  <SelectItem value="confirmations">Confirmations Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={documentOptions.format.language}
                onValueChange={(value) => updateDocumentOptions({ 
                  format: { ...documentOptions.format, language: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={documentOptions.format.currency}
                onValueChange={(value) => updateDocumentOptions({ 
                  format: { ...documentOptions.format, currency: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName"
                value={documentOptions.branding.companyName || ''}
                onChange={(e) => updateDocumentOptions({ 
                  branding: { ...documentOptions.branding, companyName: e.target.value }
                })}
                placeholder="Your Company Name"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Additional Options</Label>
            <div className="grid md:grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeQRCodes"
                  checked={documentOptions.format.includeQRCodes}
                  onCheckedChange={(checked) => updateDocumentOptions({ 
                    format: { ...documentOptions.format, includeQRCodes: !!checked }
                  })}
                />
                <Label htmlFor="includeQRCodes">Include QR Codes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeMaps"
                  checked={documentOptions.format.includeMaps}
                  onCheckedChange={(checked) => updateDocumentOptions({ 
                    format: { ...documentOptions.format, includeMaps: !!checked }
                  })}
                />
                <Label htmlFor="includeMaps">Include Maps</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includePhotos"
                  checked={documentOptions.format.includePhotos}
                  onCheckedChange={(checked) => updateDocumentOptions({ 
                    format: { ...documentOptions.format, includePhotos: !!checked }
                  })}
                />
                <Label htmlFor="includePhotos">Include Photos</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview Info */}
      {itineraryData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{itineraryData.destination || 'Sample Destination'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{itineraryData.days?.length || 3} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Document Type:</span>
                <span className="font-medium capitalize">{documentOptions.documentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Pages:</span>
                <span className="font-medium">
                  {documentOptions.documentType === 'complete' ? '8-12' :
                   documentOptions.documentType === 'summary' ? '2-3' :
                   documentOptions.documentType === 'vouchers' ? '3-5' : '1-2'} pages
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Status */}
      {(isGenerating || generationProgress > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {isGenerating ? 'Generating Document...' : 'Generation Complete'}
                </span>
                <span className="text-sm text-gray-600">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
              {isGenerating && (
                <p className="text-sm text-gray-600">
                  Please wait while we create your travel document...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Document Actions */}
      {generatedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Document Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-medium">
                    {(generatedDocument.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{generatedDocument.pageCount}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-medium">
                    {new Date(generatedDocument.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">
                    {new Date(generatedDocument.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-3">
              <Button onClick={downloadDocument} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              
              <Button onClick={previewDocument} variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button 
                onClick={() => shareDocument('link')} 
                variant="outline" 
                className="w-full"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              
              <Button 
                onClick={() => setShowShareDialog(true)} 
                variant="outline" 
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Button */}
      <div className="text-center">
        <Button 
          onClick={generateDocument}
          disabled={isGenerating}
          size="lg"
          className="px-8"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : generatedDocument ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Document
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Document
            </>
          )}
        </Button>
      </div>

      {/* Share Dialog */}
      {showShareDialog && generatedDocument && (
        <ShareDocumentDialog
          document={generatedDocument}
          shareOptions={shareOptions}
          onShareOptionsChange={setShareOptions}
          onShare={shareDocument}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}

/**
 * Share Document Dialog Component
 */
function ShareDocumentDialog({
  document,
  shareOptions,
  onShareOptionsChange,
  onShare,
  onClose
}: {
  document: GeneratedDocument;
  shareOptions: ShareOptions;
  onShareOptionsChange: (options: ShareOptions) => void;
  onShare: (method: string) => void;
  onClose: () => void;
}) {
  return (
    <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share Document</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shareEmail">Email Address</Label>
            <Input 
              id="shareEmail"
              type="email"
              placeholder="recipient@example.com"
              value={shareOptions.email || ''}
              onChange={(e) => onShareOptionsChange({
                ...shareOptions,
                email: e.target.value
              })}
            />
          </div>

          <div>
            <Label htmlFor="expiration">Expiration (days)</Label>
            <Select 
              value={shareOptions.expirationDays?.toString()}
              onValueChange={(value) => onShareOptionsChange({
                ...shareOptions,
                expirationDays: parseInt(value)
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Share Methods</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => onShare('email')}
                disabled={!shareOptions.email}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onShare('whatsapp')}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onShare('link')}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Card>
  );
} 