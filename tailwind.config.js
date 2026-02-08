/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Montserrat', 'sans-serif'],
          script: ['Yellowtail', 'cursive'],
        },
        colors: {
          prime: {
            blue: '#003366',    // Azul escuro da marca
            light: '#00AEEF',   // Azul claro do gradiente
            yellow: '#FFD700',  // Amarelo ouro
            dark: '#0f172a'
          },
          brand: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            600: '#003366', // Ajustado para o azul da marca
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          }
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'blob': 'blob 7s infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          blob: {
            '0%': { transform: 'translate(0px, 0px) scale(1)' },
            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
          }
        }
      },
    },
    plugins: [],
  }
