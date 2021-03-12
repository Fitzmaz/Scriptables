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

// constants
const DataKeyTravel = 'travel'
const DataKeyDrug = 'drug'
const DataKeyBooster = 'booster'
const DataKeyMedical = 'medical'
const DataKeyEducation = 'education'
const DataKeyBank = 'bank'
const DataKeyOC = 'oc'
const sfNames = {
  [DataKeyTravel]: 'airplane',
  [DataKeyDrug]: 'pills.fill',
  [DataKeyBooster]: 'bolt.fill.batteryblock.fill',
  [DataKeyMedical]: 'cross.case.fill'
}

// utils
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
function formatTimeLeft(t) {
  let days = Math.floor(t / 60 / 60 / 24)
  let hours = Math.floor(t / 60 / 60) % 24
  let minutes = Math.floor(t / 60) % 60
  // 仅显示最大的非零的时间单位
  const object = { days, hours, minutes }
  for (const key in object) {
    const n = object[key];
    if (n > 0) {
      return { unit: key, value: n }
    }
  }
  return undefined
}

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
    let APIKey = args.widgetParameter
    let result, factionCrimesResult
    if (APIKey !== null) {
      const api = `https://api.torn.com/user/?selections=timestamp,basic,travel,cooldowns,bars,money,education&key=${APIKey}`
      result = await this.httpGet(api, true, false)
      const factionCrimesApi = `https://api.torn.com/faction/?selections=crimes&key=${APIKey}`
      factionCrimesResult = await this.httpGet(factionCrimesApi, true, false)
    } else {
       result = {"timestamp":1615546237,"level":25,"gender":"Male","player_id":2587304,"name":"microdust","server_time":1615546237,"points":11,"cayman_bank":0,"vault_amount":0,"daily_networth":5351854926,"money_onhand":4421187,"education_current":54,"education_timeleft":49825,"status":{"description":"Okay","details":"","state":"Okay","color":"green","until":0},"travel":{"destination":"Torn","timestamp":1615545084,"departed":1615538184,"time_left":0},"cooldowns":{"drug":12120,"medical":7592,"booster":11543},"happy":{"current":4977,"maximum":5025,"increment":5,"interval":900,"ticktime":563,"fulltime":8663},"life":{"current":1181,"maximum":1181,"increment":70,"interval":300,"ticktime":263,"fulltime":0},"energy":{"current":125,"maximum":150,"increment":5,"interval":600,"ticktime":563,"fulltime":2963},"nerve":{"current":52,"maximum":61,"increment":1,"interval":300,"ticktime":263,"fulltime":2663},"chain":{"current":0,"maximum":10000,"timeout":0,"modifier":1,"cooldown":0},"city_bank":{"amount":2436000000,"time_left":6825984},"education_completed":[14,18,19,20,34,43,44,45,46,47,48,49,50,51,52,112,113,126,127]}
       factionCrimesResult = {"crimes":{"8736509":{"crime_id":4,"crime_name":"Planned robbery","participants":[{"2587304":{"description":"Okay","details":"","state":"Okay","color":"green","until":0}},{"2459216":{"description":"Returning to Torn from United Kingdom","details":"","state":"Traveling","color":"blue","until":0}},{"2601348":{"description":"Okay","details":"","state":"Okay","color":"green","until":0}},{"2596088":{"description":"Returning to Torn from Argentina","details":"","state":"Traveling","color":"blue","until":0}},{"2515101":{"description":"Traveling to Argentina","details":"","state":"Traveling","color":"blue","until":0}}],"time_started":1615449927,"time_ready":1615795527,"time_left":248739,"time_completed":0,"initiated":0,"initiated_by":0,"planned_by":2515101,"success":0,"money_gain":0,"respect_gain":0}}}
    }
    const data = await this.parseData(result)
    const ocData = this.parseCrimes(factionCrimesResult, result.player_id)
    console.log(result.player_id)
    console.log(ocData)
    Object.assign(data, ocData)
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
    const fontSize = 14
    const thisFont = Font.lightSystemFont(fontSize)
    const textSpacerLenght = 8
    let w = new ListWidget()
    await this.renderHeader(w, null, 'TORN CITY')
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
        let symbol = SFSymbol.named(sfNames[key])
        let wImage = cell.addImage(symbol.image)
        wImage.imageSize = new Size(fontSize, fontSize)
        wImage.tintColor = Color.dynamic(new Color('#000000', 1), new Color('#ffffff', 1))
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
   async parseData (data) {
    // timestamp,basic,travel,cooldowns
    let { timestamp, cooldowns, status, travel } = data
    // bars
    let { energy, nerve, happy, life, chain } = data
    // bank,edu
    let { city_bank, education_timeleft } = data
    let result = { status: status.state, energy, nerve }
    // travel
    if (status.state === 'Traveling') {
      let { destination, timestamp } =  travel
      let travelDate = new Date(timestamp * 1000)
      result[DataKeyTravel] = travelDate
      // setup notification
      await scheduleNotification({
        identifier: 'torn.travel',
        title: 'Torn Travel',
        body: `Arriving at ${destination}`
      }, new Date(travelDate.getTime() - 15 * 1000))
    }
    // cooldowns
    const keys = [DataKeyDrug, DataKeyBooster, DataKeyMedical]
    for (const key of keys) {
      // API returns 0 if the cooldown is over
      if (cooldowns[key] === 0) continue
      let cooldownDate = formatCooldown(timestamp, cooldowns[key])
      result[key] = cooldownDate
      // setup notification
      await scheduleNotification({
        identifier: `torn.cooldowns.${key}`,
        title: 'Torn Cooldowns',
        body: `Here is your ${key} cooldown reminder!`
      }, cooldownDate)
    }
    // bank
    if (city_bank && typeof city_bank.time_left !== 'undefined') {
      let timeLeft = formatTimeLeft(city_bank.time_left)
      if (timeLeft) {
        result[DataKeyBank] = `will expire in ${timeLeft.value} ${timeLeft.unit}`
      } else {
        result[DataKeyBank] = 'has expired'
      }
    }
    // edu
    if (typeof education_timeleft !== 'undefined') {
      let timeLeft = formatTimeLeft(education_timeleft)
      if (timeLeft) {
        result[DataKeyEducation] = `will end in ${timeLeft.value} ${timeLeft.unit}`
      } else {
        result[DataKeyEducation] = 'has ended'
      }
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
  parseCrimes(data, playerId) {
    let ocInfo = searchOC(data, playerId)
    if (ocInfo) {
      let { crime_name, time_left } = ocInfo
      let timeLeft = formatTimeLeft(time_left)
      return { oc: `will be ready in ${timeLeft.value} ${timeLeft.unit}` }
    }
    function searchOC(data, playerId) {
      for (const key in data.crimes) {
        const ocInfo = data.crimes[key]
        let { participants, initiated } = ocInfo
        if (initiated) continue
        for (const man of participants) {
          if (man[playerId]) {
            return ocInfo
          }
        }
      }
    }
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