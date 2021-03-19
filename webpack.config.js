const path = require('path');

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
    ],
    output: {
      filename: '[name]/[name].js',
      path: path.resolve(__dirname, 'Dist'),
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