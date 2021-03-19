module.exports = function (source, map) {
  const beginning = '// @scriptable-loader';
  if (!source.includes(beginning)) {
    this.callback(null, source, map);
    return;
  }
  const importStatement = 'import { Base } from "./「小件件」开发环境"';
  const afterBeginning = source.split(beginning)[1];
  this.callback(null, `${importStatement}\n${afterBeginning}`, map);
};
