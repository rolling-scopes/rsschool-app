const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = {
  target: "node",
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              configFile: 'tslint.json',
              tsConfigFile: 'tsconfig.json',
              emitErrors: true,
              failOnHint: true,
            },
          },
        ],
      },
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new Dotenv(),
  ],
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'rs-checkist.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: [nodeExternals()],
};
