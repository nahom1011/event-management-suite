/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1",
                secondary: "#8b5cf6",
                bg: "#030712",
                surface: "#111827",
                "surface-alt": "#1f2937",
                text: {
                    DEFAULT: "#f9fafb",
                    dim: "#9ca3af",
                }
            },
            borderRadius: {
                'radius-sm': '8px',
                'radius-md': '12px',
                'radius-lg': '16px',
                'radius-xl': '24px',
            }
        },
    },
    plugins: [],
}
