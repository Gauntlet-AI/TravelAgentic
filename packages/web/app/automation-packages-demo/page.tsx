/**
 * Automation Packages Demo Page
 * Shows that packages now work with ALL automation levels (1-4)
 */

import { AutomationPackageExample } from '@/components/automation-package-example';

export default function AutomationPackagesDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            🎉 Automation Packages Now Work With ALL Levels!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Previously packages only worked with Level 3. Now they work seamlessly 
            across all automation levels (1-4), adapting their behavior to match 
            your chosen level of automation.
          </p>
        </div>
        
        <AutomationPackageExample />
      </div>
    </div>
  );
} 