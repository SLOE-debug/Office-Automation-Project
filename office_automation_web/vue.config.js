let path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
MonacoWebpackPlugin.prototype.apply = (function (ApplyFunc) {
    return function () {
        this.options.languages.push({
            label: 'typescript',
            entry: [
                path.join(process.cwd(), '/src/CustomTs2Js/CustomTs2Js.registerLanguage.contribution.ts'),
                path.join(process.cwd(), '/src/CustomTs2Js/CustomTs2Js.contribution.ts'),
            ],
            worker: {
                id: path.join(process.cwd(), '/src/CustomTs2Js/CustomTs2JsWorker.ts'),
                entry: path.join(process.cwd(), '/src/CustomTs2Js/CustomTs2Js.worker.ts')
            }
        }, )
        ApplyFunc.apply(this, arguments)
    }
})(MonacoWebpackPlugin.prototype.apply)
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let webpack = require('webpack')

module.exports = {
    configureWebpack: {
        plugins: [
            new MonacoWebpackPlugin({
                languages: []
            }),
            // new BundleAnalyzerPlugin(),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ],
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    },
}