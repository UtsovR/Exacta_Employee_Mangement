/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: {
                        DEFAULT: '#1E40AF', // Primary Blue (700)
                        light: '#3B82F6',   // Lighter Blue (500)
                        dark: '#1E3A8A',    // Darker Blue (900)
                        highlight: '#EFF6FF', // Light Blue Background (50)
                    },
                    yellow: {
                        DEFAULT: '#FACC15', // Accent Yellow (400)
                        light: '#FEF08A',   // Light Yellow (200)
                        dark: '#CA8A04',    // Dark Yellow (600)
                    },
                    dark: '#0F172A',      // Text Dark (900)
                    gray: {
                        light: '#F8FAFC',   // Background Light (50)
                        border: '#E5E7EB',  // Border Gray (200)
                        text: '#64748B',    // Subtitle Gray (500)
                    }
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
