const path = require('path')
const webpack = require('webpack')


module.exports = {
  context: path.resolve(__dirname, './bin'),

  entry: {
    'termly': './termly.js',
    'termly-prompt': './termly-prompt.js',
  },

  output: {
    path: path.resolve(__dirname, './assets/js'),
    filename: '[name].js'
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

  plugins:[
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: false,
      minimize: false
    })
  ],
}
