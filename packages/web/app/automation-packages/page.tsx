/**
 * Automation Packages Showcase Page
 * Demonstrates the complete automation package system with all levels and custom configurations
 */

import { Metadata } from 'next';
import { AutomationPackagesShowcase } from '@/components/AutomationPackagesShowcase';

export const metadata: Metadata = {
  title: 'Automation Packages - TravelAgentic',
  description: 'Choose your automation level and package preferences for personalized travel planning',
};

export default function AutomationPackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <AutomationPackagesShowcase />
      </div>
    </div>
  );
} 