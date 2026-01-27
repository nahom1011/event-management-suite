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
    plugins: [
        function ({ addComponents }) {
            addComponents({
                '.glass-morphism': {
                    'background': 'var(--glass)',
                    'backdrop-filter': 'blur(20px) saturate(180%)',
                    '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
                    'border': '1px solid var(--glass-border)',
                    'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                },
                '.gradient-text': {
                    'background': 'linear-gradient(135deg, var(--text) 0%, var(--text-dim) 100%)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'background-clip': 'text',
                },
                '.primary-gradient-text': {
                    'background': 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'background-clip': 'text',
                },
                '.btn-primary': {
                    'background': 'var(--primary)',
                    'color': 'white',
                    'padding': '0.75rem 1.5rem',
                    'border-radius': 'var(--radius-md)',
                    'font-weight': '600',
                    'transition': 'var(--transition)',
                    'box-shadow': '0 4px 14px 0 var(--primary-glow)',
                    '&:hover': {
                        'filter': 'brightness(1.1)',
                        'transform': 'translateY(-1px)',
                        'box-shadow': '0 6px 20px 0 var(--primary-glow)',
                    },
                },
                '.card-hover': {
                    'transition': 'var(--transition)',
                    '&:hover': {
                        'transform': 'translateY(-4px)',
                        'border-color': 'hsla(238, 82%, 67%, 0.3)',
                        'box-shadow': '0 12px 40px rgba(0, 0, 0, 0.4)',
                    },
                }
            })
        }
    ],
}
