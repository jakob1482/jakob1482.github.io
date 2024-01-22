const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";
  return {
    entry: {
      main: path.join(__dirname, "_webpack", "main"),
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "assets/js"),
    },
    optimization: {
      usedExports: true,
    },
    watch: true,
    watchOptions: {
      aggregateTimeout: 200,
      poll: 1000,
      ignored: /node_modules/,
    },
    devServer: isDevelopment
      ? {
          static: {
            directory: path.resolve(__dirname, "assets/js"),
          },
          port: 3000,
          open: true,
          hot: true,
          compress: true,
          historyApiFallback: true,
          watchContentBase: true,
        }
      : {},
    module: {
      rules: [
        {
          test: /\.js$/i,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.scss$/i,
          type: "asset/source",
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "../css/bundle.css",
      }),
    ],
  };
};
