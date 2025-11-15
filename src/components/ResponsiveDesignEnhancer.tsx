import React, { useState, useEffect, memo } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface ResponsiveBreakpoints {
  sm: number;  // 640px
  md: number;  // 768px
  lg: number;  // 1024px
  xl: number;  // 1280px
  '2xl': number; // 1536px
}

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface ResponsiveDesignEnhancerProps {
  children: React.ReactNode;
  onViewportChange?: (viewport: ViewportInfo) => void;
  className?: string;
}

const BREAKPOINTS: ResponsiveBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    deviceType: 'desktop'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      const isMobile = width < BREAKPOINTS.md;
      const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
      const isDesktop = width >= BREAKPOINTS.lg;
      
      let deviceType: 'mobile' | 'tablet' | 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      else deviceType = 'desktop';

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        deviceType
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
};

const ResponsiveDesignEnhancer: React.FC<ResponsiveDesignEnhancerProps> = ({
  children,
  onViewportChange,
  className = ''
}) => {
  const viewport = useViewport();

  useEffect(() => {
    onViewportChange?.(viewport);
  }, [viewport, onViewportChange]);

  // Apply responsive classes based on viewport
  const getResponsiveClasses = () => {
    const classes = [];
    
    if (viewport.isMobile) {
      classes.push('mobile-optimized', 'touch-friendly');
    } else if (viewport.isTablet) {
      classes.push('tablet-optimized');
    } else {
      classes.push('desktop-optimized');
    }

    if (viewport.orientation === 'landscape') {
      classes.push('landscape-mode');
    } else {
      classes.push('portrait-mode');
    }

    return classes.join(' ');
  };

  return (
    <div className={`responsive-container ${getResponsiveClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Grid System
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 }, 
  gap = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  className = '' 
}) => {
  const viewport = useViewport();
  
  const getGridCols = () => {
    if (viewport.isMobile) return cols.mobile || 1;
    if (viewport.isTablet) return cols.tablet || 2;
    return cols.desktop || 3;
  };

  const getGridGap = () => {
    if (viewport.isMobile) return gap.mobile || '1rem';
    if (viewport.isTablet) return gap.tablet || '1.5rem';
    return gap.desktop || '2rem';
  };

  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
        gap: getGridGap()
      }}
    >
      {children}
    </div>
  );
};

// Responsive Typography
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  weights?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}> = ({ 
  children, 
  sizes = { mobile: 'text-sm', tablet: 'text-base', desktop: 'text-lg' },
  weights = { mobile: 'font-normal', tablet: 'font-medium', desktop: 'font-semibold' },
  className = '' 
}) => {
  const viewport = useViewport();
  
  const getSize = () => {
    if (viewport.isMobile) return sizes.mobile || 'text-sm';
    if (viewport.isTablet) return sizes.tablet || 'text-base';
    return sizes.desktop || 'text-lg';
  };

  const getWeight = () => {
    if (viewport.isMobile) return weights.mobile || 'font-normal';
    if (viewport.isTablet) return weights.tablet || 'font-medium';
    return weights.desktop || 'font-semibold';
  };

  return (
    <span className={`${getSize()} ${getWeight()} ${className}`}>
      {children}
    </span>
  );
};

// Device-specific layout components
export const MobileLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const viewport = useViewport();
  
  if (!viewport.isMobile) return null;
  
  return (
    <div className={`mobile-layout safe-area-inset-top safe-area-inset-bottom ${className}`}>
      {children}
    </div>
  );
};

export const TabletLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const viewport = useViewport();
  
  if (!viewport.isTablet) return null;
  
  return (
    <div className={`tablet-layout ${className}`}>
      {children}
    </div>
  );
};

export const DesktopLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const viewport = useViewport();
  
  if (!viewport.isDesktop) return null;
  
  return (
    <div className={`desktop-layout ${className}`}>
      {children}
    </div>
  );
};

// Viewport Debug Panel (Development only)
export const ViewportDebugger: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const viewport = useViewport();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        {isVisible ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
      
      {isVisible && (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg min-w-[200px]">
          <h3 className="text-sm font-semibold mb-2">Viewport Info</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{viewport.width}×{viewport.height}</span>
            </div>
            <div className="flex justify-between">
              <span>Device:</span>
              <span className="capitalize">{viewport.deviceType}</span>
            </div>
            <div className="flex justify-between">
              <span>Orientation:</span>
              <span className="capitalize">{viewport.orientation}</span>
            </div>
            <div className="flex justify-between">
              <span>Breakpoint:</span>
              <span>
                {viewport.width < BREAKPOINTS.md ? 'Mobile' :
                 viewport.width < BREAKPOINTS.lg ? 'Tablet' : 'Desktop'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-2 w-full p-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
          >
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Reload
          </button>
        </div>
      )}
    </div>
  );
};

// Memoized component
const MemoizedResponsiveDesignEnhancer = memo(ResponsiveDesignEnhancer);
export default MemoizedResponsiveDesignEnhancer;
