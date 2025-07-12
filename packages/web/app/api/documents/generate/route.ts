/**
 * Document Generation API
 * Generates comprehensive PDF documents for itineraries using React-PDF
 * Supports various document types and custom formatting options
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Font
} from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

// Register fonts
const fonts = {
  Inter: Font.create({
    family: 'Inter',
    fonts: [
      {
        src: fs.readFileSync(path.join(process.cwd(), 'public/fonts/Inter-Regular.ttf')),
        weight: 'normal',
      },
      {
        src: fs.readFileSync(path.join(process.cwd(), 'public/fonts/Inter-Bold.ttf')),
        weight: 'bold',
      },
    ],
  }),
};

// Global type declaration for PDF cache
declare global {
  var pdfCache: Map<string, Buffer> | undefined;
}

// Types for document generation
interface DocumentGenerationRequest {
  itineraryId: string;
  finalizationId?: string;
  documentType: 'complete' | 'summary' | 'vouchers' | 'confirmations';
  format?: {
    includeQRCodes?: boolean;
    includeMaps?: boolean;
    includePhotos?: boolean;
    language?: string;
    currency?: string;
  };
  branding?: {
    logoUrl?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

interface DocumentResponse {
  success: boolean;
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

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 5
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  summaryCard: {
    width: '23%',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  dayCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden'
  },
  dayHeader: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  dayDate: {
    fontSize: 12,
    color: '#6B7280'
  },
  dayBadge: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    padding: 5,
    borderRadius: 4,
    fontSize: 10
  },
  itemList: {
    padding: 15
  },
  item: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  itemContent: {
    flex: 1
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3
  },
  itemDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 5
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  itemDetail: {
    fontSize: 10,
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    padding: 3,
    borderRadius: 3
  },
  confirmationSection: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 8,
    marginTop: 20
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 10
  },
  confirmationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15
  },
  confirmationItem: {
    width: '45%'
  },
  confirmationLabel: {
    fontSize: 10,
    color: '#166534',
    marginBottom: 3
  },
  confirmationValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280'
  },
  footerLink: {
    fontSize: 10,
    color: '#2563EB'
  },
  qrCodeSection: {
    alignItems: 'center',
    marginTop: 15
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5
  },
  qrLabel: {
    fontSize: 8,
    color: '#6B7280'
  }
});

/**
 * POST /api/documents/generate
 * Generate PDF document for itinerary
 */
export async function POST(request: NextRequest) {
  try {
    const body: DocumentGenerationRequest = await request.json();
    
    // Validate required fields
    if (!body.itineraryId) {
      return NextResponse.json(
        { error: 'Missing required field: itineraryId' },
        { status: 400 }
      );
    }

    // Generate the document
    const documentResult = await generateDocument(body);

    return NextResponse.json(documentResult, { status: 200 });
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}

/**
 * Generate PDF document based on request parameters
 */
async function generateDocument(request: DocumentGenerationRequest): Promise<DocumentResponse> {
  const documentId = generateDocumentId();
  const startTime = Date.now();

  try {
    // Get itinerary data (mock for Phase 5)
    const itineraryData = await getItineraryData(request.itineraryId);
    const bookingData = request.finalizationId ? 
      await getBookingData(request.finalizationId) : null;

    // Create React-PDF document
    const pdfDocument = createItineraryDocument(itineraryData, bookingData, request);
    
    // Render to buffer
    const pdfBuffer = await renderToBuffer(pdfDocument);
    
    // In production, save to cloud storage (S3, etc.)
    const downloadUrl = await savePDFToStorage(documentId, pdfBuffer);
    
    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    return {
      success: true,
      documentId,
      downloadUrl,
      fileSize: pdfBuffer.length,
      pageCount: calculatePageCount(itineraryData),
      generatedAt,
      expiresAt,
      metadata: {
        documentType: request.documentType,
        itineraryId: request.itineraryId,
        language: request.format?.language || 'en',
        currency: request.format?.currency || 'USD'
      }
    };

  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF document');
  }
}

/**
 * Create React-PDF document structure
 */
function createItineraryDocument(
  itineraryData: any, 
  bookingData: any, 
  request: DocumentGenerationRequest
) {
  return React.createElement(Document, {
    title: `Travel Itinerary - ${itineraryData.destination}`,
    author: 'TravelAgentic',
    subject: 'Travel Itinerary',
    creator: 'TravelAgentic AI',
    producer: 'React-PDF'
  }, [
    // Cover Page
    React.createElement(Page, { 
      key: 'cover',
      size: 'A4', 
      style: styles.page 
    }, [
      // Header
      React.createElement(View, { 
        key: 'header',
        style: styles.header 
      }, [
        React.createElement(View, { key: 'title-section' }, [
          React.createElement(Text, { 
            key: 'title',
            style: styles.headerTitle 
          }, `${itineraryData.destination} Travel Itinerary`),
          React.createElement(Text, { 
            key: 'subtitle',
            style: styles.headerSubtitle 
          }, `${formatDate(itineraryData.startDate)} - ${formatDate(itineraryData.endDate)}`)
        ]),
        React.createElement(Text, { 
          key: 'doc-id',
          style: { fontSize: 10, color: '#6B7280' } 
        }, `Document ID: ${request.itineraryId}`)
      ]),

      // Trip Summary
      React.createElement(View, { 
        key: 'summary',
        style: styles.section 
      }, [
        React.createElement(Text, { 
          key: 'summary-title',
          style: styles.sectionTitle 
        }, 'Trip Summary'),
        React.createElement(View, { 
          key: 'summary-grid',
          style: styles.summaryGrid 
        }, [
          React.createElement(View, { 
            key: 'dest-card',
            style: styles.summaryCard 
          }, [
            React.createElement(Text, { 
              key: 'dest-label',
              style: styles.summaryLabel 
            }, 'Destination'),
            React.createElement(Text, { 
              key: 'dest-value',
              style: styles.summaryValue 
            }, itineraryData.destination)
          ]),
          React.createElement(View, { 
            key: 'duration-card',
            style: styles.summaryCard 
          }, [
            React.createElement(Text, { 
              key: 'duration-label',
              style: styles.summaryLabel 
            }, 'Duration'),
            React.createElement(Text, { 
              key: 'duration-value',
              style: styles.summaryValue 
            }, `${itineraryData.days.length} days`)
          ]),
          React.createElement(View, { 
            key: 'travelers-card',
            style: styles.summaryCard 
          }, [
            React.createElement(Text, { 
              key: 'travelers-label',
              style: styles.summaryLabel 
            }, 'Travelers'),
            React.createElement(Text, { 
              key: 'travelers-value',
              style: styles.summaryValue 
            }, `${itineraryData.travelers} people`)
          ]),
          React.createElement(View, { 
            key: 'cost-card',
            style: styles.summaryCard 
          }, [
            React.createElement(Text, { 
              key: 'cost-label',
              style: styles.summaryLabel 
            }, 'Total Cost'),
            React.createElement(Text, { 
              key: 'cost-value',
              style: styles.summaryValue 
            }, `$${itineraryData.totalCost}`)
          ])
        ])
      ]),

      // Daily Itinerary
      React.createElement(View, { 
        key: 'itinerary',
        style: styles.section 
      }, [
        React.createElement(Text, { 
          key: 'itinerary-title',
          style: styles.sectionTitle 
        }, 'Daily Itinerary'),
        ...itineraryData.days.map((day: any, dayIndex: number) =>
          React.createElement(View, { 
            key: `day-${dayIndex}`,
            style: styles.dayCard 
          }, [
            React.createElement(View, { 
              key: `day-header-${dayIndex}`,
              style: styles.dayHeader 
            }, [
              React.createElement(View, { key: `day-info-${dayIndex}` }, [
                React.createElement(Text, { 
                  key: `day-title-${dayIndex}`,
                  style: styles.dayTitle 
                }, `Day ${day.dayNumber} - ${day.title}`),
                React.createElement(Text, { 
                  key: `day-date-${dayIndex}`,
                  style: styles.dayDate 
                }, formatDate(day.date))
              ]),
              React.createElement(Text, { 
                key: `day-badge-${dayIndex}`,
                style: styles.dayBadge 
              }, `${day.items.length} activities`)
            ]),
            React.createElement(View, { 
              key: `day-items-${dayIndex}`,
              style: styles.itemList 
            }, day.items.map((item: any, itemIndex: number) =>
              React.createElement(View, { 
                key: `item-${dayIndex}-${itemIndex}`,
                style: styles.item 
              }, [
                React.createElement(View, { 
                  key: `item-icon-${dayIndex}-${itemIndex}`,
                  style: styles.itemIcon 
                }, [
                  React.createElement(Text, { 
                    key: `item-icon-text-${dayIndex}-${itemIndex}`,
                    style: { fontSize: 12, color: '#1E40AF' } 
                  }, getItemTypeIcon(item.type))
                ]),
                React.createElement(View, { 
                  key: `item-content-${dayIndex}-${itemIndex}`,
                  style: styles.itemContent 
                }, [
                  React.createElement(Text, { 
                    key: `item-title-${dayIndex}-${itemIndex}`,
                    style: styles.itemTitle 
                  }, item.title),
                  React.createElement(Text, { 
                    key: `item-desc-${dayIndex}-${itemIndex}`,
                    style: styles.itemDescription 
                  }, item.description),
                  React.createElement(View, { 
                    key: `item-details-${dayIndex}-${itemIndex}`,
                    style: styles.itemDetails 
                  }, [
                    React.createElement(Text, { 
                      key: `item-time-${dayIndex}-${itemIndex}`,
                      style: styles.itemDetail 
                    }, `Time: ${item.time}`),
                    item.price && React.createElement(Text, { 
                      key: `item-price-${dayIndex}-${itemIndex}`,
                      style: styles.itemDetail 
                    }, `Price: ${item.price}`),
                    item.duration && React.createElement(Text, { 
                      key: `item-duration-${dayIndex}-${itemIndex}`,
                      style: styles.itemDetail 
                    }, `Duration: ${item.duration}`)
                  ].filter(Boolean))
                ])
              ])
            ))
          ])
        )
      ]),

      // Booking Confirmations (if available)
      bookingData && React.createElement(View, { 
        key: 'confirmations',
        style: styles.confirmationSection 
      }, [
        React.createElement(Text, { 
          key: 'confirmation-title',
          style: styles.confirmationTitle 
        }, 'Booking Confirmations'),
        React.createElement(View, { 
          key: 'confirmation-grid',
          style: styles.confirmationGrid 
        }, [
          React.createElement(View, { 
            key: 'confirmation-number',
            style: styles.confirmationItem 
          }, [
            React.createElement(Text, { 
              key: 'conf-num-label',
              style: styles.confirmationLabel 
            }, 'Confirmation Number'),
            React.createElement(Text, { 
              key: 'conf-num-value',
              style: styles.confirmationValue 
            }, bookingData.confirmationNumber)
          ]),
          React.createElement(View, { 
            key: 'booking-status',
            style: styles.confirmationItem 
          }, [
            React.createElement(Text, { 
              key: 'status-label',
              style: styles.confirmationLabel 
            }, 'Booking Status'),
            React.createElement(Text, { 
              key: 'status-value',
              style: styles.confirmationValue 
            }, 'Confirmed')
          ])
        ])
      ]),

      // Footer
      React.createElement(View, { 
        key: 'footer',
        style: styles.footer 
      }, [
        React.createElement(Text, { 
          key: 'footer-text',
          style: styles.footerText 
        }, `Generated on ${formatDate(new Date())} by TravelAgentic`),
        React.createElement(Link, {
          key: 'footer-link',
          src: 'https://travelagentic.com',
          style: styles.footerLink
        }, 'www.travelagentic.com')
      ])
    ])
  ]);
}

/**
 * Mock data functions
 */
async function getItineraryData(itineraryId: string) {
  return {
    id: itineraryId,
    destination: 'Paris, France',
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    travelers: 2,
    totalCost: 2450,
    days: [
      {
        dayNumber: 1,
        title: 'Arrival Day',
        date: new Date(),
        items: [
          {
            type: 'flight',
            title: 'Flight to Paris',
            description: 'Direct flight, 8h duration',
            time: '10:00 AM',
            price: '$650',
            duration: '8h'
          },
          {
            type: 'hotel',
            title: 'Hotel Check-in',
            description: 'Luxury hotel in city center',
            time: '3:00 PM',
            price: '$200/night'
          },
          {
            type: 'restaurant',
            title: 'Welcome Dinner',
            description: 'French cuisine at local bistro',
            time: '7:00 PM',
            price: '$85',
            duration: '2h'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'City Exploration',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            type: 'activity',
            title: 'Eiffel Tower Visit',
            description: 'Iconic landmark with city views',
            time: '9:00 AM',
            price: '$30',
            duration: '3h'
          },
          {
            type: 'activity',
            title: 'Louvre Museum',
            description: 'World-famous art museum',
            time: '2:00 PM',
            price: '$45',
            duration: '4h'
          }
        ]
      }
    ]
  };
}

async function getBookingData(finalizationId: string) {
  return {
    confirmationNumber: 'TR-2024-001',
    status: 'confirmed',
    bookingDate: new Date().toISOString(),
    totalAmount: 2450,
    currency: 'USD'
  };
}

/**
 * Utility functions
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getItemTypeIcon(type: string): string {
  const icons = {
    flight: '✈️',
    hotel: '🏨',
    activity: '🎯',
    restaurant: '🍽️',
    transport: '🚗'
  };
  return icons[type as keyof typeof icons] || '📍';
}

function calculatePageCount(itineraryData: any): number {
  // Estimate page count based on content
  const basePages = 1; // Cover page
  const dayPages = Math.ceil(itineraryData.days.length / 2); // 2 days per page
  return basePages + dayPages;
}

async function savePDFToStorage(documentId: string, pdfBuffer: Buffer): Promise<string> {
  // Mock storage save - in production, save to S3/cloud storage
  const fileName = `itinerary-${documentId}.pdf`;
  const mockUrl = `/api/documents/${documentId}/download`;
  
  // Store buffer in memory cache for demo (in production, use persistent storage)
  global.pdfCache = global.pdfCache || new Map();
  global.pdfCache.set(documentId, pdfBuffer);
  
  return mockUrl;
}

function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 