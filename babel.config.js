module.exports = {
  presets: [
    // 使用当前node的版本进行转化
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
