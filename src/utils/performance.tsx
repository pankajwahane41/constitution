import React, { lazy, Suspense, memo, useMemo, useCallback, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Loading Component with Design System
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
      <p className="text-neutral-600 text-sm font-medium">{text}</p>
    </div>
  );
};

// Lazy Loading Wrapper with Error Boundaries
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackText?: string
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingSpinner text={fallbackText} />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// Performance Monitoring Hook
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log performance metrics
      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
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

// Optimized Event Handlers
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Memoized Computed Values
export const useOptimizedMemo = <T,>(
  factory: () => T,
  deps: React.DependencyList | undefined
): T => {
  return useMemo(factory, deps);
};

// Image Optimization Component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  placeholder = 'empty',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useOptimizedCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useOptimizedCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div className={`bg-neutral-100 flex items-center justify-center ${className}`}>
        <span className="text-neutral-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
});

// Virtual Scrolling for Large Lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );
  
  const paddingTop = visibleStart * itemHeight;
  const paddingBottom = (items.length - visibleEnd - 1) * itemHeight;
  
  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    Math.min(items.length, visibleEnd + 1 + overscan)
  );

  const handleScroll = useOptimizedCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ paddingTop, paddingBottom }}>
        {visibleItems.map((item, index) => 
          renderItem(item, visibleStart - overscan + index)
        )}
      </div>
    </div>
  );
});

// Re-export utility functions from performanceUtils
export { useDebouncedValue, useIntersectionObserver, logBundleSize, trackMemoryUsage, markPerformance, measurePerformance } from './performanceUtils';