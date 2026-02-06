import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#6d28d9",
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#8b5cf6",
                    foreground: "#ffffff",
                },
            },
            borderRadius: {
                '3xl': '1.5rem',
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "fade-out": {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0" },
                },
                "slide-in-from-top": {
                    "0%": { transform: "translateY(-100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "slide-in-from-bottom": {
                    "0%": { transform: "translateY(100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "slide-in-from-left": {
                    "0%": { transform: "translateX(-100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                "slide-in-from-right": {
                    "0%": { transform: "translateX(100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                "slide-out-to-right": {
                    "0%": { transform: "translateX(0)", opacity: "1" },
                    "100%": { transform: "translateX(100%)", opacity: "0" },
                },
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                "scale-out": {
                    "0%": { transform: "scale(1)", opacity: "1" },
                    "100%": { transform: "scale(0.95)", opacity: "0" },
                },
                "bounce-subtle": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" },
                },
                "shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "pulse-subtle": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "gradient-shift": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-out",
                "fade-out": "fade-out 0.2s ease-in",
                "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
                "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
                "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
                "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
                "slide-out-to-right": "slide-out-to-right 0.2s ease-in",
                "scale-in": "scale-in 0.2s ease-out",
                "scale-out": "scale-out 0.2s ease-in",
                "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
                "shimmer": "shimmer 2s ease-in-out infinite",
                "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
                "float": "float 3s ease-in-out infinite",
                "gradient-shift": "gradient-shift 3s ease infinite",
            },
            transitionTimingFunction: {
                "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
                "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            },
        },
    },
    plugins: [],
};
export default config;
