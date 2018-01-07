const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')

const projectPath = path.resolve(__dirname, '..')
const contentPath = path.resolve(projectPath, 'webpack')
const staticPath = path.resolve(projectPath, 'static')
const contentBase = path.resolve(projectPath, 'public')
const webpackPublicPath = '/bundle/'
const webpackOutputPath = path.join(contentBase, webpackPublicPath)

console.log(contentBase)
console.log(webpackPublicPath)
console.log(webpackOutputPath)
const isDebug = process.env.NODE_ENV !== 'production'

const config = module.exports = {
  projectPath: projectPath,
  contentBase: contentBase,
  static: {
    path: staticPath
  }
}


config.webpack = {
  entry: {
    home: [path.join(contentPath, 'entry/home.js')]
  },
  output: {
    path: webpackOutputPath,
    publicPath: webpackPublicPath,
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  resolve: {
    alias: {
      '~': contentPath
    }
  },
  module: {
    loaders: [{
      test: /\.html$/,
      loader: 'raw-loader!html-minify-loader'
    }, {
      test: /.pug/,
      loader: 'pug-loader'
    }, {
      test: /\.css$/,
      use: [{
        loader: "style-loader/useable",
        options: {
          sourceMap: true
        }
      }, {
        loader: "css-loader"
      }],
    }, {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'regenerator-loader'
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        name: 'img/[name].[hash:8].[ext]'
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'style-loader',
      query: {
        name: 'fonts/[name].[hash:8].[ext]'
      }
    }]
  },
  plugins: [
    new CleanWebpackPlugin([contentBase]),
    new webpack.ProvidePlugin({
      Vue: ['vue/dist/vue.esm.js', 'default']
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(contentPath, 'html/home/index.pug'),
      filename: '../index.html',
      alwaysWriteToDisk: true

    }),
    new HtmlWebpackHarddiskPlugin()
  ],
  devtool: (isDebug) ? 'source-map' : false
}


config['webpack-dev-server'] = {
  contentBase: contentBase,
  hot: true,
  inline: true,
  quiet: false,
  noInfo: false,
  publicPath: webpackPublicPath,
  stats: {
    colors: true
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
}

if (isDebug) {
  require('vue').config.devtools = true;
}