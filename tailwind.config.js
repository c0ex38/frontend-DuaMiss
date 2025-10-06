/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Accent color gradients - needed for dynamic theme colors
    'from-blue-500',
    'from-purple-500',
    'from-green-500',
    'from-red-500',
    'from-yellow-500',
    'from-pink-500',
    'from-emerald-500',
    'to-purple-600',
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-emerald-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
  