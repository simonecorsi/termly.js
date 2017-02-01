const path = require('path')
const webpack = require('webpack')

const IS_PROD = (process.env.NODE_ENV === 'production')

module.exports = {
  context: path.resolve(__dirname, './bin'),

  entry: {
    'termly': './termly.js',
    'termly-prompt': './termly-prompt.js',
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: `[name].min.js`
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      include: [
        path.resolve(__dirname, "bin"),
      ],
      loader: "babel-loader",
      options: { presets: ['es2015', 'stage-3'] }
    }]
  },

  // UglifyJS sourcemap still broken, don't use in developer build if you have to
  // manually debug something
  plugins: IS_PROD ? [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: false,
      minimize: true,
    })
  ] : [],

  devtool: process.env.NODE_ENV === 'dev' ? 'source-map' : false
}
