const plugin = require("tailwindcss/plugin");

module.exports = {
  mode: "jit",
  content: [
    "./_drafts/**/*.html",
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/*.md",
    "./*.md",
    "./*.html",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  darkMode: "class",
  theme: {
    screens: {
      "3xs": "320px",
      "2xs": "480px",
      xs: "550px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      linkedin:
        "-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Fira Sans,Ubuntu,Oxygen,Oxygen Sans,Cantarell,Droid Sans,Apple Color Emoji,Segoe UI Emoji,Segoe UI Emoji,Segoe UI Symbol,Lucida Grande,Helvetica,Arial,sans-serif",
    },
    svgPath: {
      "dark-theme-mask":
        "M 29.5,11.5 A 8,8 0 0 1 21.5,19.5 8,8 0 0 1 13.5,11.5 8,8 0 0 1 21.5,3.5 a 8,8 0 0 1 8,8 Z",
    },
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
          125: "#F1F1F1",
          150: "#EDEDED",
          175: "#E9E9E9",
          180: "#E8E8E8",
          205: "#E6E6E6",
          250: "#DDDDDD",
          350: "#BCBCBC",
          450: "#8B8B8B",
          550: "#636363",
          650: "#494949",
          675: "#424242",
          725: "#393939",
          750: "#333333",
          760: "#313131",
          770: "#2F2F2F",
          775: "#2C2C2C",
          780: "#2A2A2A",
          790: "#282828",
          825: "#222222",
          850: "#1F1F1F",
          880: "#1A1A1A",
        },
      },
      transitionProperty: {
        width: "width",
        height: "height",
        dimensions: "width, height",
        spacing: "margin, padding",
        transform: "transform",
        opacity: "opacity",
        backdrop: "backdrop-filter, background-color",
        visibility: "visibility, opacity",
        path: "d",
        modal: "visibility, transform, opacity",
        icon: "transform, color, background-color, border-color, text-decoration-color, fill, stroke",
        "icon-expand":
          "width, padding, opacity, color, border-color, text-decoration-color",
      },
      transitionTimingFunction: {
        swing: "cubic-bezier(.02, .01, .47, 1)",
        "in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        expand: "cubic-bezier(0.23, 0, 0.32, 1)",
      },
      transitionDuration: {
        175: "175ms",
        225: "225ms",
        325: "325ms",
        400: "400ms",
        "visibility-300": "0ms, 300ms",
        "modal-300": "0ms, 300ms, 300ms",
        "icon-expand": "300ms, 300ms, 150ms, 150ms, 150ms, 150ms",
      },
      transitionDelay: {
        225: "225ms",
        "visibility-300": "300ms, 0ms",
        "modal-300": "300ms, 0ms, 0ms",
        "icon-expand": "0ms, 0ms, 150ms, 0ms, 0ms, 0ms",
      },
      padding: {
        13: "52px",
      },
      maxWidth: {
        700: "700px",
      },
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography"),
    require("tw-elements/dist/plugin.cjs"),
    // Custom plugin for modifying a path's d attribute
    plugin(function ({ addUtilities, theme }) {
      const paths = theme("svgPath");
      const utilities = Object.entries(paths).reduce((acc, [key, value]) => {
        acc[`.path-${key}`] = { d: `path('${value}')` };
        return acc;
      }, {});

      addUtilities(utilities, ["responsive"]);
    }),
  ],
};
