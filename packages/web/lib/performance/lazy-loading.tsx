/**
 * Lazy Loading Utilities for Phase 6 Performance Optimization
 * Implements component lazy loading and code splitting for mobile performance
 */

import React, { lazy, ComponentType, LazyExoticComponent } from 'react';
import dynamic from 'next/dynamic';

// Lazy loading configurations
export interface LazyLoadOptions {
  loading?: () => React.ReactNode;
  ssr?: boolean;
  suspense?: boolean;
  delay?: number;
}

/**
 * Enhanced lazy loading with loading states and error boundaries
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    loading: LoadingComponent,
    suspense = true,
    delay = 200
  } = options;

  if (LoadingComponent) {
    // Use Next.js dynamic for better control
    return dynamic(importFunction, {
      loading: LoadingComponent,
      ssr: options.ssr !== false,
    }) as LazyExoticComponent<T>;
  }

  // Fallback to React lazy
  return lazy(async () => {
    // Add artificial delay for better UX (prevents flash)
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return importFunction();
  });
}

/**
 * Default loading component for lazy loaded components
 */
export function DefaultLazyLoader({ 
  message = 'Loading...', 
  className = '' 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

/**
 * Skeleton loading component for better perceived performance
 */
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Utility for preloading components based on user interactions
 */
export class ComponentPreloader {
  private static preloaded = new Set<string>();
  
  /**
   * Preload a component when user hovers or focuses on a trigger
   */
  static preload(componentName: string, importFn?: () => Promise<any>) {
    if (this.preloaded.has(componentName)) return;
    
    if (importFn) {
      // Custom import function
      importFn().catch(() => {
        // Ignore preload errors
      });
    }
    
    this.preloaded.add(componentName);
  }
  
  /**
   * Preload components based on current route
   */
  static preloadForRoute(currentPath: string) {
    switch (currentPath) {
      case '/enhanced-home':
        // Preload building page (likely next step)
        this.preload('ItineraryBuilding', () => import('@/app/itinerary/building/page'));
        break;
        
      case '/itinerary/building':
        // Preload view and preferences pages
        this.preload('ItineraryView', () => import('@/app/itinerary/view/page'));
        this.preload('ItineraryPreferences', () => import('@/app/itinerary/preferences/page'));
        break;
        
      case '/itinerary/view':
        // Preload finalization
        this.preload('ItineraryFinalize', () => import('@/app/itinerary/finalize/page'));
        break;
        
      case '/itinerary/preferences':
        // Preload view (user will return here)
        this.preload('ItineraryView', () => import('@/app/itinerary/view/page'));
        break;
    }
  }
}

/**
 * Hook for intersection observer-based lazy loading
 */
export function useIntersectionLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [node, setNode] = React.useState<Element | null>(null);
  
  React.useEffect(() => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, [node, threshold]);
  
  return [setNode, isVisible] as const;
}

/**
 * Component wrapper for intersection-based lazy loading
 */
export function IntersectionLazyLoad({
  children,
  fallback,
  threshold = 0.1,
  className = ''
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  className?: string;
}) {
  const [setNode, isVisible] = useIntersectionLazyLoad(threshold);
  
  return (
    <div ref={setNode} className={className}>
      {isVisible ? children : (fallback || <SkeletonLoader />)}
    </div>
  );
} 