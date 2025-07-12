/**
 * Mobile Optimization Utilities for Phase 6
 * Implements performance optimizations specifically for mobile devices
 */

import { useEffect, useState, useCallback } from 'react';

// Mobile device detection
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowPowerDevice: boolean;
  connectionType: string;
  screenSize: {
    width: number;
    height: number;
  };
}

/**
 * Hook for detecting mobile devices and performance characteristics
 */
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowPowerDevice: false,
    connectionType: 'unknown',
    screenSize: { width: 1024, height: 768 }
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      // Performance characteristics
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isLowPowerDevice = hardwareConcurrency <= 2 || deviceMemory <= 2;

      // Connection type
      const connection = (navigator as any).connection;
      const connectionType = connection?.effectiveType || 'unknown';

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isLowPowerDevice,
        connectionType,
        screenSize: { width, height }
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

/**
 * Mobile-specific performance configurations
 */
export interface MobilePerformanceConfig {
  reduceAnimations: boolean;
  limitConcurrentRequests: boolean;
  enableImageOptimization: boolean;
  useSkeletonLoading: boolean;
  deferNonCriticalJS: boolean;
  maxConcurrentRequests: number;
}

/**
 * Get optimized configuration based on device capabilities
 */
export function getMobilePerformanceConfig(deviceInfo: DeviceInfo): MobilePerformanceConfig {
  const isSlowDevice = deviceInfo.isLowPowerDevice || 
                      deviceInfo.connectionType === 'slow-2g' || 
                      deviceInfo.connectionType === '2g';

  return {
    reduceAnimations: isSlowDevice,
    limitConcurrentRequests: deviceInfo.isMobile || isSlowDevice,
    enableImageOptimization: deviceInfo.isMobile,
    useSkeletonLoading: deviceInfo.isMobile,
    deferNonCriticalJS: isSlowDevice,
    maxConcurrentRequests: isSlowDevice ? 2 : deviceInfo.isMobile ? 4 : 6
  };
}

/**
 * Image optimization for mobile devices
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
}

export function getOptimizedImageProps(
  props: OptimizedImageProps,
  deviceInfo: DeviceInfo
): OptimizedImageProps {
  const config = getMobilePerformanceConfig(deviceInfo);
  
  if (!config.enableImageOptimization) {
    return props;
  }

  // Adjust quality for mobile devices
  const quality = deviceInfo.isMobile ? Math.min(props.quality || 75, 65) : props.quality;
  
  // Adjust dimensions for mobile
  let { width, height } = props;
  if (deviceInfo.isMobile && width && height) {
    const scale = Math.min(1, deviceInfo.screenSize.width / (width || 800));
    width = Math.round((width || 0) * scale);
    height = Math.round((height || 0) * scale);
  }

  return {
    ...props,
    width,
    height,
    quality
  };
}

/**
 * Request queue for managing concurrent API calls on mobile
 */
class MobileRequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const requestFn = this.queue.shift();
    
    if (requestFn) {
      try {
        await requestFn();
      } finally {
        this.running--;
        this.process(); // Process next in queue
      }
    }
  }

  setMaxConcurrent(max: number) {
    this.maxConcurrent = max;
  }
}

// Global request queue instance
let globalRequestQueue: MobileRequestQueue | null = null;

/**
 * Hook for managing API requests with mobile optimization
 */
export function useMobileOptimizedFetch() {
  const deviceInfo = useDeviceInfo();
  const config = getMobilePerformanceConfig(deviceInfo);

  // Initialize request queue
  useEffect(() => {
    if (config.limitConcurrentRequests && !globalRequestQueue) {
      globalRequestQueue = new MobileRequestQueue(config.maxConcurrentRequests);
    } else if (globalRequestQueue) {
      globalRequestQueue.setMaxConcurrent(config.maxConcurrentRequests);
    }
  }, [config.limitConcurrentRequests, config.maxConcurrentRequests]);

  const optimizedFetch = useCallback(async (
    url: string, 
    options?: RequestInit
  ): Promise<Response> => {
    const fetchFn = () => fetch(url, options);
    
    if (config.limitConcurrentRequests && globalRequestQueue) {
      return globalRequestQueue.add(fetchFn);
    }
    
    return fetchFn();
  }, [config.limitConcurrentRequests]);

  return {
    fetch: optimizedFetch,
    config,
    deviceInfo
  };
}

/**
 * Viewport optimization utilities
 */
export interface ViewportConfig {
  enableVirtualization: boolean;
  itemsPerPage: number;
  bufferSize: number;
}

export function getViewportConfig(deviceInfo: DeviceInfo): ViewportConfig {
  if (deviceInfo.isMobile) {
    return {
      enableVirtualization: true,
      itemsPerPage: 10,
      bufferSize: 5
    };
  }
  
  if (deviceInfo.isTablet) {
    return {
      enableVirtualization: false,
      itemsPerPage: 20,
      bufferSize: 10
    };
  }
  
  return {
    enableVirtualization: false,
    itemsPerPage: 50,
    bufferSize: 25
  };
}

/**
 * Performance monitoring for mobile devices
 */
export class MobilePerformanceMonitor {
  private metrics: Record<string, number> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor paint timing
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics[entry.name] = entry.startTime;
        }
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          this.metrics['loadTime'] = navEntry.loadEventEnd - navEntry.loadEventStart;
          this.metrics['domContentLoaded'] = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
        }
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  trackCustomMetric(name: string, value: number) {
    this.metrics[name] = value;
  }

  startTiming(label: string) {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.metrics[label] = endTime - startTime;
    };
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * CSS optimization utilities
 */
export function getCSSOptimizations(deviceInfo: DeviceInfo) {
  const config = getMobilePerformanceConfig(deviceInfo);
  
  return {
    // Disable animations on slow devices
    animations: config.reduceAnimations ? 'none' : 'all',
    
    // Reduce transform complexity on mobile
    willChange: deviceInfo.isMobile ? 'transform' : 'auto',
    
    // Use GPU acceleration carefully on mobile
    transform: deviceInfo.isMobile ? 'translateZ(0)' : 'none',
    
    // Optimize scroll performance
    scrollBehavior: deviceInfo.isMobile ? 'auto' : 'smooth',
    
    // Reduce visual effects on slow devices
    backdropFilter: config.reduceAnimations ? 'none' : 'blur(10px)',
    
    // Touch optimization
    touchAction: deviceInfo.isMobile ? 'manipulation' : 'auto'
  };
}

/**
 * Bundle size optimization utilities
 * These provide patterns for conditional imports based on device capabilities
 */
export const MobileOptimizationPatterns = {
  // Example patterns for conditional imports
  shouldUseCharts: (deviceInfo: DeviceInfo) => !deviceInfo.isLowPowerDevice,
  shouldUsePDFGeneration: (deviceInfo: DeviceInfo) => !deviceInfo.isLowPowerDevice,
  shouldUseAnimations: (deviceInfo: DeviceInfo) => {
    const config = getMobilePerformanceConfig(deviceInfo);
    return !config.reduceAnimations;
  },
  shouldUseHeavyComponents: (deviceInfo: DeviceInfo) => deviceInfo.isDesktop,
}; 