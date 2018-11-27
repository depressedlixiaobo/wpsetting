const InterpolateHtmlPlugin = require('./common/InterpolateHtmlPlugin')
const InlineChunkHtmlPlugin = require('./common/InlineChunkHtmlPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin');
const ComConfig = require('./common/Config')

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';


const ConfigManager = new ComConfig()
const paths = ConfigManager.getDir()

module.exports = {

    mode: "development",
    entry: [paths.appSrc],//'./config/polyfills.js',
    output: {
        path: paths.appBuild,
        filename: "static/js/[name].[hash:8].js",
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
        publicPath: ConfigManager.publicPath(),  //判断 开发环境和生产环境， 如果是开发环境 则返回空的，如生产模式则正常读取文件

    },

    devtool: "cheap-module-source-map",
    module: {
        rules: [
            //js
            {
                test: /\.js$/,
                include: [paths.appSrc],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-transform-async-to-generator", // async ()=>
                            "@babel/plugin-proposal-async-generator-functions", //function*
                            "@babel/plugin-proposal-object-rest-spread", //{...a}
                            "@babel/plugin-proposal-class-properties",  //类初始化器
                            "@babel/plugin-proposal-optional-chaining",  // ?.
                            ["@babel/plugin-proposal-decorators", { "legacy": true }]  // @MyTest
                        ]
                    }
                }
            },
            //html
            {
                test: /.html$/,
                include: [paths.appPublic]
            },
            //image 
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'static/media/[hash:8].[ext]',
                            limit: 1
                        }
                    }
                ]
            },
            //css
            {
                test: /\.scss$/,
                use: [

                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: paths.appPublic,

                        }
                    },
                    {
                        loader: "css-loader",// 将 CSS 转化成 CommonJS 模块
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: "sass-loader" // 将 Sass 编译成 CSS
                    }]
            }

        ]
    },


    optimization: {
        splitChunks: {
            chunks: 'all',
            name: false,
        },

        runtimeChunk: true,
    },
    
    plugins: [



        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,

        }),

        new InterpolateHtmlPlugin(HtmlWebpackPlugin, paths.appPublic),

        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath: '/',
            //  extensions:  [  '.css']
        }),
    ]
}


// xiangmu fencha ?
