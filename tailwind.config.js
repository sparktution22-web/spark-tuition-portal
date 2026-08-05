/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spark: {
          orange: '#FF6B00',
          accent: '#FF8C32',
          ink: '#1A1A1A',
          dark: '#222222',
          white: '#FFFFFF',
          surface: '#F8F9FA',
          peach: '#FFE9D9',
          'peach-deep': '#FFD3B0'
        }
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem'
      },
      boxShadow: {
        soft: '0 8px 30px -6px rgba(255,107,0,0.15)',
        card: '0 4px 24px -4px rgba(26,26,26,0.08)',
        'card-hover': '0 12px 40px -8px rgba(255,107,0,0.25)',
        glass: '0 8px 32px 0 rgba(31,38,135,0.10)'
      },
      backgroundImage: {
        'spark-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FF8C32 100%)',
        'spark-radial': 'radial-gradient(circle at 30% 20%, rgba(255,107,0,0.18), transparent 60%)'
      },
      animation: {
        'blob-1': 'blobMove1 18s ease-in-out infinite',
        'blob-2': 'blobMove2 22s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'count-pulse': 'countPulse 0.6s ease-out'
      },
      keyframes: {
        blobMove1: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.08)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.95)' }
        },
        blobMove2: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(-30px,30px) scale(1.05)' },
          '66%': { transform: 'translate(20px,-20px) scale(0.98)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-1deg)' }
        },
        countPulse: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
