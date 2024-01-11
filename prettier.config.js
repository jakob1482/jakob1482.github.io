module.exports = {
  plugins: [
    "@shopify/prettier-plugin-liquid",
    "prettier-plugin-css-order",
    "prettier-plugin-organize-attributes",
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss",
  ],
  tailwindConfig: "./tailwind.config.js",
  proseWrap: "always",
  printWidth: 80,
  endOfLine: "lf",
  singleAttributePerLine: true,
  overrides: [{ files: "*.html", options: { parser: "liquid-html" } }],
};
