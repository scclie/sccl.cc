/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Nord Theme Colors
          nord: {
            // Polar Night
            0: '#2e3440',
            1: '#3b4252', 
            2: '#434c5e',
            3: '#4c566a',
            // Snow Storm
            4: '#d8dee9',
            5: '#e5e9f0',
            6: '#eceff4',
            // Frost
            7: '#8fbcbb',
            8: '#88c0d0',
            9: '#81a1c1',
            10: '#5e81ac',
            // Aurora
            11: '#bf616a', // red
            12: '#d08770', // orange
            13: '#ebcb8b', // yellow
            14: '#a3be8c', // green
            15: '#b48ead', // purple
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        },
        animation: {
          'fade-in': 'fadeIn 0.8s ease-out',
          'slide-up': 'slideUp 0.6s ease-out',
          'slide-down': 'slideDown 0.6s ease-out',
          'slide-left': 'slideLeft 0.6s ease-out',
          'slide-right': 'slideRight 0.6s ease-out',
          'glow': 'glow 3s ease-in-out infinite alternate',
          'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
          'bounce-soft': 'bounceSoft 1s ease-in-out',
          'rotate-slow': 'rotateSlow 20s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
          },
          slideUp: {
            '0%': { transform: 'translateY(30px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          },
          slideDown: {
            '0%': { transform: 'translateY(-30px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          },
          slideLeft: {
            '0%': { transform: 'translateX(30px)', opacity: '0' },
            '100%': { transform: 'translateX(0)', opacity: '1' }
          },
          slideRight: {
            '0%': { transform: 'translateX(-30px)', opacity: '0' },
            '100%': { transform: 'translateX(0)', opacity: '1' }
          },
          glow: {
            '0%': { 
              boxShadow: '0 0 5px rgba(136, 192, 208, 0.3), 0 0 10px rgba(129, 161, 193, 0.2)' 
            },
            '100%': { 
              boxShadow: '0 0 20px rgba(136, 192, 208, 0.6), 0 0 30px rgba(129, 161, 193, 0.4)' 
            }
          },
          pulseSoft: {
            '0%, 100%': { opacity: '0.7' },
            '50%': { opacity: '1' }
          },
          bounceSoft: {
            '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
            '40%, 43%': { transform: 'translateY(-8px)' },
            '70%': { transform: 'translateY(-4px)' },
            '90%': { transform: 'translateY(-2px)' }
          },
          rotateSlow: {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }
      },
    },
    plugins: [],
  }