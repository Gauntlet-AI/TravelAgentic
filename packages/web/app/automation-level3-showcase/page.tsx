/**
 * Level 3 Automation Package Showcase Page
 * Demonstrates the Level 3 package selection system
 */

import { Metadata } from 'next';
import { Level3PackageShowcase } from '@/components/Level3PackageShowcase';

export const metadata: Metadata = {
  title: 'Level 3 Automation Packages - TravelAgentic',
  description: 'Choose your focus area for smart automation: Budget, Experience, or Time optimization',
};

export default function Level3ShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Level3PackageShowcase />
      </div>
    </div>
  );
} 