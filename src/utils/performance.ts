// Re-export performance utilities and components
export { 
  useDebouncedValue, 
  useIntersectionObserver, 
  logBundleSize, 
  trackMemoryUsage, 
  markPerformance, 
  measurePerformance,
  createLazyComponent,
  usePerformanceMonitor,
  useOptimizedCallback,
  useOptimizedMemo
} from './performanceUtils';

export { 
  OptimizedImage, 
  VirtualScroll 
} from '../components/PerformanceComponents';