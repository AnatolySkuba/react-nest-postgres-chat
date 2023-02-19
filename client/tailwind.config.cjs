/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            boxShadow: {
                md: "0 3px 15px rgba(0, 0, 0, 0.2)",
            },
            maxWidth: {
                100: "100px",
            },
        },
    },
    plugins: [],
};
