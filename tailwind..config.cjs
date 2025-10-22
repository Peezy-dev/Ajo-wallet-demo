@type {import(`tailwindcss`).Config}
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                black: "#000000",
                white: "#ffffff",
                accent: {
                    DEFAULT: "#d6b94d"
                }
            },
            borderRadius: {
                lg: "12px"
            }
        },
    },
    plugins: [],
}