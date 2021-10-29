module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ["import", {
      "libraryName": "antd",
      "style": true
    }]
  ]
}