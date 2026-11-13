const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "src/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        "voltage-lime": "#d2e823",
        "cobalt-signal": "#2665d6",
        "bordeaux-maroon": "#780016",
        "midnight-ink": "#1e2330",
        "plaster-white": "#ffffff",
        "bone-canvas": "#f3f3f1",
        "cement-gray": "#adadad",
        "slate-mute": "#676b5f",
        carbon: "#222222",
        "lilac-whisper": "#e9c0e9",
        "indigo-abyss": "#061492",
        "forest-depth": "#254f1a",
        saffron: "#d6a337",
      },
      fontFamily: {
        sans: [
          "Linksans",
          "Inter",
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Linksans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        input: "8px",
        card: "32px",
        "card-lg": "41.6px",
        pill: "9999px",
        nav: "1000px",
      },
      letterSpacing: {
        display: "-3.44px",
        "display-alt": "-1.34px",
        "heading-lg": "-1.22px",
        heading: "-0.56px",
        "heading-sm": "-0.48px",
        subheading: "-0.4px",
        body: "-0.16px",
        "body-sm": "-0.28px",
      },
    },
  },
  plugins: [],
};
