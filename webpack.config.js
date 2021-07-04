const path = require('path');
const webpack = require('webpack');
const ScriptablePlugin = require('./webpack/scriptable-plugin')

module.exports = env => {
  let isDevelopment = env && env.development;
  let config = {
    experiments: {
      topLevelAwait: true
    },
    mode: isDevelopment ? 'development' : 'production',
    entry: {
      torn: './Scripts/torn.js'
    },
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(!isDevelopment),
      }),
      new ScriptablePlugin(),
    ],
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'build'),
      // 输出library，ScriptablePlugin会在末尾加上"await Scriptable.run();"
      library: {
        name: 'Scriptable',
        type: 'var',
      }
    },
    module: {
      rules: [
        {
          test: /\.js/,
          use: [
            {
              loader: path.resolve(__dirname, './webpack/scriptable-loader.js'),
              options: {
                /* ... */
              },
            },
          ],
        }
      ],
    },
  };
  if (isDevelopment) {
    config.devtool = 'inline-source-map';
  }
  return config;
};