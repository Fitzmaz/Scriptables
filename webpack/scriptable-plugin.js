const { ConcatSource } = require('webpack-sources')

const pluginName = 'ScriptableWebpackPlugin';

class ScriptableWebpackPlugin {
  apply(compiler) {
    const webpack = compiler.webpack;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (assets) => {
          for (const name in assets) {
            // append run statement at the end
            compilation.updateAsset(
              name,
              old => new ConcatSource(old, '\n', 'await Scriptable.run();')
            )
          }
        }
      );
    });
  }
}

module.exports = ScriptableWebpackPlugin;
