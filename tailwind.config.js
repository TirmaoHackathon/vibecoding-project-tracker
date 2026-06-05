/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          primary: "#6610F2",
          accent: "#5EF38C",
        },

        // Surfaces
        surface: {
          page: "#FAFAFF",
          card: "#EBEBFF",
        },

        // Text
        text: {
          primary: "#000000",
          muted: "#6F6F71",
        },

        // Task Types
        type: {
          feature: "#6610F2",
          bug: "#FF2E00",
        },

        // Due Dates
        due: {
          safe: "#5EF38C",
          warning: "#FF2E00",
          overdue: "#AD0000",
          neutral: "#6F6F71",
        },
      },

      fontFamily: {
        heading: ["Mozilla Text", "serif"],
        body: ["Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      borderRadius: {
        card: "0.5rem", // rounded-md
      },

      boxShadow: {
        cardHover: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
