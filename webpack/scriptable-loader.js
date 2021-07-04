module.exports = function (source, map) {
  const beginning = '// @组件代码开始';
  const ending = '// @组件代码结束';
  if (!source.includes('./「小件件」开发环境')) {
    return source;
  }
  const importStatement = 'import { Base, Running, Testing } from "./「小件件」开发环境"';
  const exportStatement = `
async function run() {
  if (PRODUCTION) {
    await Running(Widget)
  } else {
    await Testing(Widget)
  }
}
export {
  run
}
`;
  const body = source.split(beginning)[1].split(ending)[0];
  return `${importStatement}\n${body}\n${exportStatement}`;
};
