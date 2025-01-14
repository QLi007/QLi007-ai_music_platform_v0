/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1890ff',
          dark: '#096dd9',
          light: '#40a9ff'
        },
        secondary: {
          DEFAULT: '#722ed1',
          dark: '#531dab',
          light: '#9254de'
        }
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 禁用默认样式以避免与 Ant Design 冲突
  },
}

