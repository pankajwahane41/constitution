/**
 * Performance Monitoring Utilities
 * Tracks application performance metrics and prevents memory leaks
 */
import React from 'react';

interface PerformanceMetrics {
  componentRenders: Map<string, number>;
  memoryUsage: number[];
  bundleLoadTimes: Map<string, number>;
  userInteractionLatency: number[];
  errorCounts: Map<string, number>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private observer: PerformanceObserver | null = null;

  private constructor() {
    this.metrics = {
      componentRenders: new Map(),
      memoryUsage: [],
      bundleLoadTimes: new Map(),
      userInteractionLatency: [],
      errorCounts: new Map()
    };
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Monitor performance entries
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log('Page Load Performance:', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                totalLoad: navEntry.loadEventEnd - navEntry.loadEventStart
              });
            }
          }
        });
        
        this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }

    // Memory usage monitoring (if available)
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          this.metrics.memoryUsage.push(memory.usedJSHeapSize);
          
          // Keep only last 100 measurements
          if (this.metrics.memoryUsage.length > 100) {
            this.metrics.memoryUsage.shift();
          }

          // Alert if memory usage is growing too much
          if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
            console.warn('High memory usage detected:', memory.usedJSHeapSize / 1024 / 1024, 'MB');
          }
        }
      }, 10000); // Check every 10 seconds
    }
  }

  /**
   * Track component render counts
   */
  trackComponentRender(componentName: string): void {
    const currentCount = this.metrics.componentRenders.get(componentName) || 0;
    this.metrics.componentRenders.set(componentName, currentCount + 1);

    // Warn about excessive re-renders
    if (currentCount > 50) {
      console.warn(`Component ${componentName} has rendered ${currentCount} times. Consider optimization.`);
    }
  }

  /**
   * Track user interaction latency
   */
  trackInteractionLatency(startTime: number): void {
    const latency = performance.now() - startTime;
    this.metrics.userInteractionLatency.push(latency);

    // Keep only last 50 measurements
    if (this.metrics.userInteractionLatency.length > 50) {
      this.metrics.userInteractionLatency.shift();
    }

    // Warn about slow interactions
    if (latency > 100) { // 100ms threshold
      console.warn('Slow user interaction detected:', latency, 'ms');
    }
  }

  /**
   * Track bundle load performance
   */
  trackBundleLoad(bundleName: string, loadTime: number): void {
    this.metrics.bundleLoadTimes.set(bundleName, loadTime);
    
    if (loadTime > 2000) { // 2 second threshold
      console.warn(`Slow bundle load: ${bundleName} took ${loadTime}ms`);
    }
  }

  /**
   * Track application errors
   */
  trackError(errorType: string): void {
    const currentCount = this.metrics.errorCounts.get(errorType) || 0;
    this.metrics.errorCounts.set(errorType, currentCount + 1);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageMemoryUsage: number;
    averageInteractionLatency: number;
    totalRenders: number;
    totalErrors: number;
    slowestBundle: { name: string; time: number } | null;
  } {
    const memorySum = this.metrics.memoryUsage.reduce((a, b) => a + b, 0);
    const latencySum = this.metrics.userInteractionLatency.reduce((a, b) => a + b, 0);
    const totalRenders = Array.from(this.metrics.componentRenders.values()).reduce((a, b) => a + b, 0);
    const totalErrors = Array.from(this.metrics.errorCounts.values()).reduce((a, b) => a + b, 0);

    let slowestBundle: { name: string; time: number } | null = null;
    for (const [name, time] of this.metrics.bundleLoadTimes.entries()) {
      if (!slowestBundle || time > slowestBundle.time) {
        slowestBundle = { name, time };
      }
    }

    return {
      averageMemoryUsage: memorySum / this.metrics.memoryUsage.length || 0,
      averageInteractionLatency: latencySum / this.metrics.userInteractionLatency.length || 0,
      totalRenders,
      totalErrors,
      slowestBundle
    };
  }

  /**
   * Cleanup monitoring resources
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  return {
    trackRender: () => monitor.trackComponentRender(componentName),
    trackInteraction: (startTime: number) => monitor.trackInteractionLatency(startTime),
    trackError: (errorType: string) => monitor.trackError(errorType)
  };
}

/**
 * Higher-order component for automatic render tracking
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  return function MonitoredComponent(props: P) {
    const { trackRender } = usePerformanceMonitoring(displayName);
    
    React.useEffect(() => {
      trackRender();
    });

    return React.createElement(WrappedComponent, props);
  };
}

// Global error tracking
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    performanceMonitor.trackError('JavaScript Error');
    console.error('Global error caught:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    performanceMonitor.trackError('Unhandled Promise Rejection');
    console.error('Unhandled promise rejection:', event.reason);
  });
}