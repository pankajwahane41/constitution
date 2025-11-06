import React, { useState, useEffect, useRef, memo } from 'react';
import { Zap, TrendingUp, Clock, Smartphone, Monitor, Wifi, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  bundleSize: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}

interface PerformanceMonitorProps {
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const renderStartTime = useRef<number>(0);

  // Performance measurement
  useEffect(() => {
    renderStartTime.current = performance.now();

    // Measure render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Wait for next frame to measure
    requestAnimationFrame(measureRenderTime);

    // Get browser performance metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      setMetrics(prev => ({
        ...prev,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        timeToInteractive: navigation.loadEventEnd - navigation.fetchStart
      }));
    }

    // Device information
    setDeviceInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    });
  }, []);

  // Simulate performance metrics (in a real app, these would come from actual monitoring)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : Math.random() * 50 + 10,
        networkLatency: Math.random() * 200 + 50,
        bundleSize: 358.93 // Current bundle size in KB
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = () => {
    let score = 100;
    if ((metrics.renderTime || 0) > 16) score -= 10; // 60fps threshold
    if ((metrics.firstContentfulPaint || 0) > 1000) score -= 15; // FCP > 1s
    if ((metrics.timeToInteractive || 0) > 3000) score -= 15; // TTI > 3s
    if ((metrics.memoryUsage || 0) > 100) score -= 20; // Memory > 100MB
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-navy">Performance Monitor</h3>
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {isVisible ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        {/* Performance Score */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Performance Score</span>
            <span className={`text-lg font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                performanceScore >= 80 ? 'bg-green-500' :
                performanceScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${performanceScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Performance Details */}
      {isVisible && (
        <div className="p-4 space-y-4">
          {/* Core Metrics */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Core Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Render Time</span>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {(metrics.renderTime || 0).toFixed(1)}ms
                </div>
                <div className="text-xs text-blue-600">
                  {(metrics.renderTime || 0) > 16 ? 'Needs optimization' : 'Good'}
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">FCP</span>
                </div>
                <div className="text-lg font-bold text-green-900">
                  {(metrics.firstContentfulPaint || 0 / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-green-600">
                  First Contentful Paint
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Monitor className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Memory</span>
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {(metrics.memoryUsage || 0).toFixed(1)}MB
                </div>
                <div className="text-xs text-purple-600">
                  Heap Usage
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Wifi className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">Network</span>
                </div>
                <div className="text-lg font-bold text-orange-900">
                  {Math.round(metrics.networkLatency || 0)}ms
                </div>
                <div className="text-xs text-orange-600">
                  Latency
                </div>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Device Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Screen:</span>
                <span className="text-gray-900 font-medium">{deviceInfo.screenSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Viewport:</span>
                <span className="text-gray-900 font-medium">{deviceInfo.viewportSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Device Pixel Ratio:</span>
                <span className="text-gray-900 font-medium">{deviceInfo.devicePixelRatio}</span>
              </div>
              {deviceInfo.connection && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className="text-gray-900 font-medium">
                    {deviceInfo.connection.effectiveType} ({deviceInfo.connection.downlink}Mbps)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Optimization Suggestions</h4>
            <div className="space-y-2">
              {performanceScore < 80 && (
                <div className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-orange-800">Performance Issues Detected</div>
                    <div className="text-xs text-orange-700">
                      Consider optimizing render performance and reducing bundle size
                    </div>
                  </div>
                </div>
              )}
              
              {(metrics.memoryUsage || 0) > 100 && (
                <div className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-red-800">High Memory Usage</div>
                    <div className="text-xs text-red-700">
                      Memory usage is above 100MB. Consider cleanup and optimization.
                    </div>
                  </div>
                </div>
              )}

              {performanceScore >= 80 && (
                <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5"></div>
                  <div>
                    <div className="text-sm font-medium text-green-800">Excellent Performance</div>
                    <div className="text-xs text-green-700">
                      Your app is running optimally with great performance scores.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced mobile touch interaction component
export const MobileTouchOptimizer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsOptimized(hasTouch);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStart.time;

    // Prevent 300ms delay on mobile
    if (deltaX < 10 && deltaY < 10 && deltaTime < 500) {
      e.preventDefault();
    }
    
    setTouchStart(null);
  };

  return (
    <div
      className={`
        ${isOptimized ? 'touch-optimized' : ''}
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: isOptimized ? 'manipulation' : 'auto',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
    </div>
  );
};

// Memoized components
const MemoizedPerformanceMonitor = memo(PerformanceMonitor);
export { MemoizedPerformanceMonitor as PerformanceMonitor };
export default MemoizedPerformanceMonitor;
