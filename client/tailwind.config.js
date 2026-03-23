/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3858F6',
        'primary-dark': '#2a45c9',
        secondary: '#111827',
        accent: '#FF3385',
        ink: '#111827',
        soft: '#F8F8F8',
        cream: '#fafaf9',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 4px #cfcfcf',
        'card-hover': '0 0 20px #cfcfcf',
        'blue-glow': '0 8px 24px rgba(56, 88, 246, 0.28)',
      },
    },
  },
  plugins: [],
}
