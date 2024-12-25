"use strict";
const path = require("path");
const webpack = require("webpack");

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  runtimeCompiler: true,
  transpileDependencies: [/\bbootstrap-vue\b/, /\bvue-plyr\b/, /\bdom7\b/],

  configureWebpack: {
    // plugins: [],
    plugins: [
      // new BundleAnalyzerPlugin(),
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        BUILD_TIME: JSON.stringify(new Date())
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    }
  },

  chainWebpack: config => {
    // Add "node_modules" alias
    config.resolve.alias.set(
      "node_modules",
      path.join(__dirname, "./node_modules")
    );

    // Disable "prefetch" plugin since it's not properly working in some browsers
    config.plugins.delete("prefetch");

    // Do not remove whitespaces
    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap(options => {
        options.compilerOptions.whitespace = "preserve";
        return options;
      });

    config.performance.maxEntrypointSize(400 * 1024).maxAssetSize(500 * 1024);
  },

  devServer: {
    https: false,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },

  pluginOptions: {
    i18n: {
      locale: "vi",
      fallbackLocale: "vi",
      localeDir: "locales",
      enableInSFC: false
    }
  }
};
