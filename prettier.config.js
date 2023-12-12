module.exports = {
  plugins: [
    "prettier-plugin-css-order",
    "prettier-plugin-organize-attributes",
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss",
    "@shopify/prettier-plugin-liquid",
  ],
  proseWrap: "always",
  printWidth: 80,
  endOfLine: "lf",
  singleAttributePerLine: true,
  overrides: [
    {
      files: "*.html",
      options: {
        parser: "liquid-html",
      },
    },
  ],
};
