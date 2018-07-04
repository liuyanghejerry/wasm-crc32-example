const path = require('path');

module.exports = {
  entry: './browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  optimization: {
    minimize: false
  },
  module: {
    noParse: [
      // Suppress warnings and errors logged by benchmark.js when bundled using webpack.
      // https://github.com/bestiejs/benchmark.js/issues/106
      path.resolve(__dirname, './node_modules/benchmark/benchmark.js')
    ],
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader',
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        use: 'arraybuffer-loader',
      }
    ]
  },
};
