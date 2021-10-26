module.exports = {
  presets: [["@babel/preset-env", { targets: { node: true } }]],
  plugins: ["import-graphql"],
};
