const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let webpack = require('webpack')

module.exports = {
    configureWebpack: {
        plugins: [
            new MonacoWebpackPlugin(),
            // new BundleAnalyzerPlugin(),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ],
        module: {
            // rules: [{
            //     test: /\.Worker\.ts$/,
            //     loader: 'worker-loader'
            // }, ]
        },
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    },
}