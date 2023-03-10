/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            boxShadow: {
                md: "0 3px 15px rgba(0, 0, 0, 0.2)",
            },
            fontSize: {
                13: "13px",
            },
            lineHeight: {
                2: "8px",
            },
            width: {
                2.2: "9px",
            },
            height: {
                2.2: "9px",
            },
        },
    },
    plugins: [],
};
