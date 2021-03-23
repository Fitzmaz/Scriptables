const path = require('path');
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
      new ScriptablePlugin()
    ],
    output: {
      filename: '[name]/[name].js',
      path: path.resolve(__dirname, 'Dist'),
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