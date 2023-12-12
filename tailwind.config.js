module.exports = {
  mode: "jit",
  content: [
    "./_drafts/**/*.html",
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/*.md",
    "./*.md",
    "./*.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            p: {
              hyphens: "auto",
            },
          },
        },
      }),
      colors: {
        neutral: {
          75: "#F5F8FB",
          150: "#EDEDED",
          175: "#E9E9E9",
          250: "#DDDDDD",
          350: "#BCBCBC",
          450: "#8B8B8B",
          550: "#636363",
          650: "#494949",
          750: "#333333",
          850: "#1F1F1F",
        },
      },
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};
