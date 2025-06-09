/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-navy": "var(--brand-navy)",
        "brand-teal": "var(--brand-teal)",
        "brand-coral": "var(--brand-coral)",
        "brand-ivory": "var(--brand-ivory)",
        "grey-700":   "var(--grey-700)",
        "grey-300":   "var(--grey-300)",
        "grey-50":    "var(--grey-50)",
      },
      fontFamily: {
        // Use Space Grotesk for headings (h1/h2/h3), and Inter for body
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
    }
  },
  plugins: [],
};
