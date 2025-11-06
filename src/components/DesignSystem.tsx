import React, { memo } from 'react';

// Design System Colors
export const colors = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12'
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  accent: {
    purple: '#8b5cf6',
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#eab308',
    pink: '#ec4899',
    indigo: '#6366f1'
  }
};

// Design System Components
export const DesignSystem: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Color Palette */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Color Palette</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Colors */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Primary (Orange)</h4>
            <div className="space-y-2">
              {Object.entries(colors.primary).map(([shade, color]) => (
                <div key={shade} className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-600">{shade}</span>
                  <span className="text-sm text-gray-500">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Secondary (Green)</h4>
            <div className="space-y-2">
              {Object.entries(colors.secondary).map(([shade, color]) => (
                <div key={shade} className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-600">{shade}</span>
                  <span className="text-sm text-gray-500">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Accent</h4>
            <div className="space-y-2">
              {Object.entries(colors.accent).map(([name, color]) => (
                <div key={name} className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-600 capitalize">{name}</span>
                  <span className="text-sm text-gray-500">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Typography Scale */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Typography Scale</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-navy">Heading 1 - 4xl Bold</h1>
            <h2 className="text-3xl font-semibold text-navy">Heading 2 - 3xl Semibold</h2>
            <h3 className="text-2xl font-semibold text-navy">Heading 3 - 2xl Semibold</h3>
            <h4 className="text-xl font-medium text-navy">Heading 4 - xl Medium</h4>
            <h5 className="text-lg font-medium text-navy">Heading 5 - lg Medium</h5>
            <h6 className="text-base font-medium text-navy">Heading 6 - base Medium</h6>
          </div>
          <div className="space-y-2">
            <p className="text-base text-gray-700">Body text - base (16px) Regular</p>
            <p className="text-sm text-gray-600">Small text - sm (14px) Regular</p>
            <p className="text-xs text-gray-500">Extra small - xs (12px) Regular</p>
          </div>
        </div>
      </div>

      {/* Button Variants */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Button Variants</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Outline Button
            </button>
            <button className="px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
              Ghost Button
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg opacity-50 cursor-not-allowed" disabled>
              Disabled Button
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              Gradient Button
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Danger Button
            </button>
          </div>
        </div>
      </div>

      {/* Card Components */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Card Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-navy mb-2">Basic Card</h4>
            <p className="text-gray-600 text-sm">A simple card with basic styling and content.</p>
          </div>

          {/* Elevated Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h4 className="font-semibold text-navy mb-2">Elevated Card</h4>
            <p className="text-gray-600 text-sm">A card with enhanced shadow for elevated appearance.</p>
          </div>

          {/* Interactive Card */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer">
            <h4 className="font-semibold text-navy mb-2">Interactive Card</h4>
            <p className="text-gray-600 text-sm">A card with hover effects for interactive elements.</p>
          </div>

          {/* Feature Card */}
          <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-lg border border-orange-200 p-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold">★</span>
            </div>
            <h4 className="font-semibold text-navy mb-2">Feature Card</h4>
            <p className="text-gray-600 text-sm">A card with gradient background and feature highlighting.</p>
          </div>
        </div>
      </div>

      {/* Form Elements */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Form Elements</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Field</label>
            <input
              type="text"
              placeholder="Enter text here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Dropdown</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Textarea</label>
            <textarea
              rows={3}
              placeholder="Enter your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Status Indicators</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Success</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Error</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Info</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized component
const MemoizedDesignSystem = memo(DesignSystem);
export default MemoizedDesignSystem;
