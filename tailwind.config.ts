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
            }
        },
    },
    plugins: [],
};
export default config;
