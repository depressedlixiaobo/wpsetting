const InterpolateHtmlPlugin = require('./common/InterpolateHtmlPlugin')
const InlineChunkHtmlPlugin = require('./common/InlineChunkHtmlPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin') 
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ComConfig = require('./common/Config')

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const ConfigManager  = new ComConfig() 
const paths =  ConfigManager.getDir()
 
module.exports = {

    mode: "production",
    bail: true,
    //入口
    entry: [paths.appSrc] ,//'./config/polyfills.js',
    //输出
    output: {
        //编译后路径
        path:  paths.appBuild ,
        //js目录
        //filename: 'static/js/[name].[chunkhash:8].js',
         filename: "static/js/[name].[hash:8].js",
         chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
        //资源目录
        publicPath: ConfigManager.publicPath(),  //判断 开发环境和生产环境， 如果是开发环境 则返回空的，如生产模式则正常读取文件
        // devtoolModuleFilenameTemplate: info =>
        //     path
        //     .relative('./src', info.absoluteResourcePath)
        //     .replace(/\\/g, '/'),
    },
    
    devtool: "source-map", 
    module: {
        rules:[
            //js
            {
                test:/\.js$/,
                include:[paths.appSrc],
                use:{
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
                test:/.html$/,
                include:[paths.appPublic]
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
                        publicPath: ConfigManager.publicPath(),
                         
                      }
                },
                {
                    loader: "css-loader" ,// 将 CSS 转化成 CommonJS 模块
                    options:{
                        sourceMap:true
                    }
                }, {
                    loader: "sass-loader" // 将 Sass 编译成 CSS
                }]
            }

        ]
    },

    
    optimization: {
        //压缩
        minimizer:[
            new TerserPlugin({
                terserOptions: {
                  parse: {
                    // we want terser to parse ecma 8 code. However, we don't want it
                    // to apply any minfication steps that turns valid ecma 5 code
                    // into invalid ecma 5 code. This is why the 'compress' and 'output'
                    // sections only apply transformations that are ecma 5 safe
                    // https://github.com/facebook/create-react-app/pull/4234
                    ecma: 8,
                  },
                  compress: {
                    ecma: 5,
                    warnings: false,
                    // Disabled because of an issue with Uglify breaking seemingly valid code:
                    // https://github.com/facebook/create-react-app/issues/2376
                    // Pending further investigation:
                    // https://github.com/mishoo/UglifyJS2/issues/2011
                    comparisons: false,
                    // Disabled because of an issue with Terser breaking valid code:
                    // https://github.com/facebook/create-react-app/issues/5250
                    // Pending futher investigation:
                    // https://github.com/terser-js/terser/issues/120
                    inline: 2,
                  },
                //   mangle: {
                //     safari10: true,
                //   },
                  output: {
                    ecma: 5,
                    comments: false,
                    // Turned on because emoji and regex is not minified properly using default
                    // https://github.com/facebook/create-react-app/issues/2488
                    ascii_only: true,
                  },
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: true,
              }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                  
                    map: {
                        inline: false,
                        annotation: true,
                    }
                }
            })
            //postcss-safe-parser暂时不添加了
        ],
        splitChunks: {
            chunks: 'all',
            name: false,
        },
        // Keep the runtime chunk seperated to enable long term caching
        // https://twitter.com/wSokra/status/969679223278505985
        runtimeChunk: true,
    },
     
    plugins: [
      
        new HtmlWebpackPlugin({
            inject: true,
            template:paths.appHtml,
            // minify: {
            //     removeComments: true,
            //     collapseWhitespace: true,
            //     removeRedundantAttributes: true,
            //     useShortDoctype: true,
            //     removeEmptyAttributes: true,
            //     removeStyleLinkTypeAttributes: true,
            //     keepClosingSlash: true,
            //     minifyJS: true,
            //     minifyCSS: true,
            //     minifyURLs: true,
            // },
        }) ,
     
        new InterpolateHtmlPlugin(HtmlWebpackPlugin,ConfigManager.publicPath()),
       
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath: ConfigManager.publicPath(),
          //  extensions:  [  '.css']
          }),
    ]
}
 

// xiangmu fencha ?
