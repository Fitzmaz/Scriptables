// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: comments;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: comments;
// 
// iOS 桌面组件脚本 @「小件件」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
// https://x.im3x.cn
// 

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule
const { Base } = require("./「小件件」开发环境")

// @组件代码开始
class Widget extends Base {
  /**
   * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
   * @param {string} arg 自定义参数
   */
  constructor (arg) {
    super(arg)
    this.name = '示例小组件'
    this.desc = '「小件件」—— 原创精美实用小组件'
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render () {
    let APIKey = 'ISAKUPtu2FEBgN5d'
    const data = await this.getData(APIKey)
    switch (this.widgetFamily) {
      case 'large':
        return await this.renderLarge(data)
      case 'medium':
        return await this.renderMedium(data)
      default:
        return await this.renderSmall(data)
    }
  }

  /**
   * 渲染小尺寸组件
   */
  async renderSmall (data) {
    let w = new ListWidget()
    await this.renderHeader(w, data['logo'], data['title'])
    const t = w.addText(data['content'])
    t.font = Font.lightSystemFont(16)
    w.addSpacer()
    w.url = this.actionUrl('open-url', data['url'])
    return w
  }
  /**
   * 渲染中尺寸组件
   */
  async renderMedium (data, num = 3) {
    const isDarkMode = Device.isUsingDarkAppearance()
    const fontSize = 14
    const thisFont = Font.lightSystemFont(fontSize)
    const textSpacerLenght = 8
    let w = new ListWidget()
    await this.renderHeader(w, 'https://www.torn.com/images/v2/svg_icons/sprites/user_status_icons_sprite.svg', 'TORN CITY')
    for (const key in data) {
      const cell = w.addStack()
      cell.centerAlignContent()
      const cell_box = cell.addStack()
      cell_box.size = new Size(3, 15)
      cell_box.backgroundColor = new Color('#ff837a', 0.6)
      cell.addSpacer(10)
      let value = data[key]
      if (typeof value === 'string') {
        // status
        const cell_text = cell.addText(`${key}: ${value}`)
        cell_text.font = thisFont
      } else if (value instanceof Date) {
        // cooldowns
        const sfNames = {
          travel: 'airplane',
          drug: 'pills.fill',
          booster: 'bolt.fill.batteryblock.fill',
          medical: 'cross.case.fill'
        }
        let symbol = SFSymbol.named(sfNames[key])
        let wImage = cell.addImage(symbol.image)
        wImage.imageSize = new Size(fontSize, fontSize)
        wImage.tintColor = isDarkMode ? new Color('#ffffff', 1) : new Color('#000000', 1)
        cell.addText(` @ `).font = thisFont
        let dueDate = cell.addDate(value)
        dueDate.font = thisFont
        dueDate.applyTimeStyle()
        cell.addText(` in `).font = thisFont
        let timer = cell.addDate(value)
        timer.font = thisFont
        timer.applyTimerStyle()
      } else {
        // bars
        const barColors = {
          energy: '#00ff00',
          nerve: '#ff0000'
        }
        let barData = data[key]
        let percent = barData.current / barData.maximum
        // bar
        let energyBar = cell.addStack()
        energyBar.addSpacer(0)
        energyBar.size = new Size(100, 20)
        energyBar.backgroundColor = new Color('#888888', 1)
        let inner = energyBar.addStack()
        inner.size = new Size(energyBar.size.width * percent, energyBar.size.height)
        inner.backgroundColor = new Color(barColors[key], 1)
        energyBar.addSpacer()
        cell.addSpacer(textSpacerLenght)
        // text
        let text = `${barData.current}/${barData.maximum}`
        cell.addText(text).font = thisFont
      }
      // cell.url = this.actionUrl("open-url", d['url'])
      cell.addSpacer()
      w.addSpacer(8)
    }
    // updateTime
    let footer = w.addStack()
    footer.centerAlignContent()
    footer.addText('距离上次更新').font = thisFont
    footer.addSpacer(textSpacerLenght)
    let updateDate = footer.addDate(new Date())
    updateDate.font = thisFont
    updateDate.applyRelativeStyle()
    footer.addSpacer()
    //
    w.addSpacer()
    w.refreshAfterDate = new Date(Date.now() + 30 * 1000)
    return w
  }
  /**
   * 渲染大尺寸组件
   */
  async renderLarge (data) {
    return await this.renderMedium(data, 10)
  }

  /**
   * 获取数据函数，函数名可不固定
   */
  async getData (APIKey) {
    const api = `https://api.torn.com/user/?selections=timestamp,basic,travel,cooldowns,bars&key=${APIKey}`
    const data = await this.httpGet(api, true, false)
    // timestamp,basic,travel,cooldowns
    let { timestamp, cooldowns, status, travel } = data
    // bars
    let { energy, nerve, happy, life, chain } = data
    function formatHM(number, n) {
      let string = String(number)
      n = n || 2
      while (string.length < n) {
        string = '0' + string
      }
      return string
    }
    function _formatCooldown(timestamp, delta) {
      let dueDate = new Date((timestamp + delta) * 1000)
      let dueHours = formatHM(dueDate.getHours())
      let dueMinutes = formatHM(dueDate.getMinutes())
      let deltaHours = formatHM(Math.floor(delta / 60 / 60) % 24)
      let deltaMinutes = formatHM(Math.floor(delta / 60) % 60)
      return `@ ${dueHours}:${dueMinutes} LT, in ${deltaHours}h ${deltaMinutes}m`
    }
    function formatCooldown(timestamp, delta) {
      return new Date((timestamp + delta) * 1000)
    }
    let result = { status: status.state, energy, nerve }
    // travel
    if (status.state === 'Traveling') {
      let { destination, timestamp } =  travel
      let travelDate = new Date(timestamp * 1000)
      result.travel = travelDate
      // setup notification
      await scheduleNotification({
        identifier: 'torn.travel',
        title: 'Torn Travel',
        body: `Arriving at ${destination}`
      }, travelDate)
    }
    // cooldowns
    const keys = ['drug', 'booster', 'medical']
    for (const key of keys) {
      let cooldownDate = formatCooldown(timestamp, cooldowns[key])
      result[key] = cooldownDate
      // setup notification
      await scheduleNotification({
        identifier: `torn.cooldowns.${key}`,
        title: 'Torn Cooldowns',
        body: `Here is your ${key} cooldown reminder!`
      }, cooldownDate)
    }
    async function scheduleNotification(options, triggerDate) {
      const { identifier } = options
      await Notification.removePending([identifier])
      let n = new Notification()
      n = Object.assign(n, options)
      n.setTriggerDate(triggerDate)
      await n.schedule()
    }
    return result
  }

  /**
   * 自定义注册点击事件，用 actionUrl 生成一个触发链接，点击后会执行下方对应的 action
   * @param {string} url 打开的链接
   */
  async actionOpenUrl (url) {
    Safari.openInApp(url, false)
  }

}
// @组件代码结束

const { Testing } = require("./「小件件」开发环境")
await Testing(Widget)