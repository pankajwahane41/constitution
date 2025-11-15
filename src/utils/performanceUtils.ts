// Performance utility functions and hooks
import React, { lazy, Suspense, memo, useMemo, useCallback, useState, useEffect } from 'react';

// Debounced Input Hook  
export const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Intersection Observer Hook for Lazy Loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
  }, [ref, options]);

  return [setRef, isIntersecting] as const;
};

// Lazy Loading Wrapper with Error Boundaries
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackText?: string
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: React.ComponentProps<T>) => (
    React.createElement(Suspense, 
      { fallback: React.createElement('div', { className: 'p-4 text-center' }, fallbackText || 'Loading...') },
      React.createElement(LazyComponent, props)
    )
  ));
};

// Performance Monitor Hook
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log slow components
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Component ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
      
      // Report to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // window.gtag?.('event', 'component_render', {
        //   component: componentName,
        //   render_time: renderTime
        // });
      }
    };
  });
};

// Optimized Event Handlers - wrapper for useCallback with better typing
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps) as T;
};

// Memoized Computed Values - wrapper for useMemo with better typing
export const useOptimizedMemo = <T,>(
  factory: () => T,
  deps: React.DependencyList | undefined
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
};

// Performance monitoring utilities
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Rough bundle size estimation
    const estimate = document.getElementsByTagName('script').length * 50; // rough estimate
    console.log(`Estimated bundle size: ~${estimate}KB`);
    
    // Performance timing info
    if (performance && performance.getEntriesByType) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        console.log('Page Load Performance:', {
          domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
          loadComplete: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
          firstByte: navigationTiming.responseStart - navigationTiming.fetchStart
        });
      }
    }
  }
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log('Memory Usage:', {
      usedJSHeapSize: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
      totalJSHeapSize: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
      jsHeapSizeLimit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Performance marks and measures
export const markPerformance = (name: string) => {
  if (performance.mark) {
    performance.mark(name);
  }
};

export const measurePerformance = (name: string, startMark: string, endMark: string) => {
  if (performance.measure) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
  }
};