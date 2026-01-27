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
                    DEFAULT: "#dc2626",
                    dark: "#991b1b",
                    light: "#ef4444",
                },
                black: {
                    DEFAULT: "#000000",
                    dark: "#0a0a0a",
                    card: "#111111",
                    elevated: "#1a1a1a",
                },
                accent: {
                    gold: "#fbbf24",
                    green: "#10b981",
                    blue: "#3b82f6",
                },
                text: {
                    DEFAULT: "#ffffff",
                    secondary: "#a3a3a3",
                    dim: "#737373",
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            boxShadow: {
                'red': '0 8px 32px rgba(220, 38, 38, 0.3)',
                'red-glow': '0 0 40px rgba(220, 38, 38, 0.4)',
                'dark': '0 4px 16px rgba(0, 0, 0, 0.5)',
                'dark-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-red': 'pulse-red 2s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'pulse-red': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
                    '50%': { boxShadow: '0 0 0 20px rgba(220, 38, 38, 0)' },
                },
                glow: {
                    '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.4))' },
                    '50%': { filter: 'drop-shadow(0 0 16px rgba(220, 38, 38, 0.4))' },
                },
            },
        },
    },
    plugins: [],
}
