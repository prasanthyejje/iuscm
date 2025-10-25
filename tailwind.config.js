/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#d2ac67',
        'cream': '#fff9db',
        'gold-dark': '#6d5a25',
        'earth-brown': '#3a2e12',
        'earth-medium': '#5a4a1f',
        'earth-dark': '#2d2308',
        'cream-light': '#fffdf5',
        'gold-light': 'rgba(255, 206, 84, 0.6)',
      },
      fontFamily: {
        'sans': ['Noto Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'quote': ['Noto Rashi Hebrew', 'Noto Sans', 'sans-serif'],
      },
      spacing: {
        'container-desktop': '96px',
        'container-laptop': '64px',
        'container-tablet': '48px',
        'container-mobile': '20px',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
      },
      maxWidth: {
        'container': '1440px',
        'content': '1248px',
        'hero': '662.68px',
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '1.2', fontWeight: '600' }],
        'hero-mobile': ['28px', { lineHeight: '1.1', fontWeight: '600' }],
        'section': ['38px', { lineHeight: '1.2', fontWeight: '700' }],
        'subtitle': ['18px', { lineHeight: '1.6' }],
      },
      backgroundImage: {
        'gradient-spiritual': 'radial-gradient(90% 60% at 50% 100%, rgba(255, 230, 154, 0.40) 0%, rgba(255, 230, 154, 0.00) 60%), linear-gradient(180deg, rgba(255, 248, 207, 0.70) 0%, rgba(255, 253, 245, 0.70) 40%, rgba(255, 253, 242, 0.70) 100%), #FFFFFF',
        'hero-overlay': 'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.30) 65%, rgba(0, 0, 0, 0.30) 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
