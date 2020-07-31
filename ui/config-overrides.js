/* eslint-disable @typescript-eslint/no-var-requires */
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  plugins: [
    // new MonacoWebpackPlugin(["javascript", "json", "typescript", "yaml"])
    new MonacoWebpackPlugin(["yaml"])
  ]
};
