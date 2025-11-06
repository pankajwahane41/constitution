/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#FF6B35',
					50: '#FFF5F2',
					100: '#FFEDE5',
					200: '#FFDACC',
					300: '#FFC7B3',
					400: '#FFB499',
					500: '#FF6B35',
					600: '#F55514',
					700: '#C74410',
					800: '#99340C',
					900: '#6B2408',
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#8B5CF6',
					50: '#F5F3FF',
					100: '#EDE9FE',
					200: '#DDD6FE',
					300: '#C4B5FD',
					400: '#A78BFA',
					500: '#8B5CF6',
					600: '#7C3AED',
					700: '#6D28D9',
					800: '#5B21B6',
					900: '#4C1D95',
					foreground: '#FFFFFF',
				},
				accent: {
					DEFAULT: '#F59E0B',
					50: '#FFFBEB',
					100: '#FEF3C7',
					200: '#FDE68A',
					300: '#FCD34D',
					400: '#FBBF24',
					500: '#F59E0B',
					600: '#D97706',
					700: '#B45309',
					800: '#92400E',
					900: '#78350F',
					foreground: '#FFFFFF',
				},
				success: {
					DEFAULT: '#10B981',
					50: '#ECFDF5',
					100: '#D1FAE5',
					200: '#A7F3D0',
					300: '#6EE7B7',
					400: '#34D399',
					500: '#10B981',
					600: '#059669',
					700: '#047857',
					800: '#065F46',
					900: '#064E3B',
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				navy: {
					DEFAULT: '#1E293B',
					50: '#F8FAFC',
					100: '#F1F5F9',
					200: '#E2E8F0',
					300: '#CBD5E1',
					400: '#94A3B8',
					500: '#64748B',
					600: '#475569',
					700: '#334155',
					800: '#1E293B',
					900: '#0F172A',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
				'slide-in-bottom': {
					from: { 
						transform: 'translateY(100%)',
						opacity: '0'
					},
					to: { 
						transform: 'translateY(0)',
						opacity: '1'
					},
				},
				'slide-in-top': {
					from: { 
						transform: 'translateY(-100%)',
						opacity: '0'
					},
					to: { 
						transform: 'translateY(0)',
						opacity: '1'
					},
				},
				'slide-in-right': {
					from: { 
						transform: 'translateX(100%)',
						opacity: '0'
					},
					to: { 
						transform: 'translateX(0)',
						opacity: '1'
					},
				},
				'slide-in-left': {
					from: { 
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					to: { 
						transform: 'translateX(0)',
						opacity: '1'
					},
				},
				'scale-in': {
					from: { 
						transform: 'scale(0.9)',
						opacity: '0'
					},
					to: { 
						transform: 'scale(1)',
						opacity: '1'
					},
				},
				'bounce-in': {
					'0%': { 
						transform: 'scale(0.3)',
						opacity: '0'
					},
					'50%': { 
						transform: 'scale(1.05)'
					},
					'70%': { 
						transform: 'scale(0.9)'
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1'
					},
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(255, 107, 53, 0.7)',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.2s ease-in',
				'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
				'slide-in-top': 'slide-in-top 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'shimmer': 'shimmer 2s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
				'glow-lg': '0 0 40px rgba(255, 107, 53, 0.6)',
				'premium': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
				'premium-lg': '0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)',
				'premium-xl': '0 24px 64px rgba(0, 0, 0, 0.16), 0 12px 32px rgba(0, 0, 0, 0.12)',
			},
			backdropBlur: {
				xs: '2px',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
