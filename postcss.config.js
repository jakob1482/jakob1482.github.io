module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("postcss-preset-env"),
    require("autoprefixer"),
    require("cssnano")({ preset: "default" }),
  ],
};
