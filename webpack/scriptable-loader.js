module.exports = function (source, map) {
  const beginning = '// @组件代码开始';
  const ending = '// @组件代码结束';
  if (!source.includes('./「小件件」开发环境')) {
    this.callback(null, source, map);
    return;
  }
  const importStatement = 'import { Base, Running } from "./「小件件」开发环境"';
  const exportStatement = `
async function run() {
  await Running(Widget)
}
export {
  run
}
`;
  const body = source.split(beginning)[1].split(ending)[0];
  this.callback(null, `${importStatement}\n${body}\n${exportStatement}`, map);
};
