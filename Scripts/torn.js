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
const DEBUG = true

// @scriptable-loader

// @组件代码开始

// constants
const DataKeyTimestamp = 'timestamp'
const DataKeyStatus = 'status'
const DataKeyEnergy = 'energy'
const DataKeyNerve = 'nerve'
const DataKeyTravel = 'travel'
const DataKeyDrug = 'drug'
const DataKeyBooster = 'booster'
const DataKeyMedical = 'medical'
const DataKeyBank = 'bank'
const DataKeyEducation = 'education'
const DataKeyOC = 'oc'
const sfNames = {
  [DataKeyTravel]: 'airplane',
  [DataKeyDrug]: 'pills.fill',
  [DataKeyBooster]: 'shift.fill',
  [DataKeyMedical]: 'cross.case.fill'
}
const cooldownsChar = {
  [DataKeyTravel]: '飞',
  [DataKeyDrug]: '药',
  [DataKeyBooster]: '酒',
  [DataKeyMedical]: '医'
}
const useSFSymbol = true

// UX
const fontSize = 14
const thisFont = Font.lightSystemFont(fontSize)
const textSpacerLenght = 8
const EnergyColor = '#4d7c1e'
const NerveColor = '#b3382c'

// utils
function addLeadingZeros(number, n = 2) {
  let string = String(number)
  while (string.length < n) {
    string = '0' + string
  }
  return string
}
function formatHHMM(dueDate) {
  let dueHours = addLeadingZeros(dueDate.getHours())
  let dueMinutes = addLeadingZeros(dueDate.getMinutes())
  return `${dueHours}:${dueMinutes}`
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
    this.name = 'TORN 小组件'
    this.version = '0.0.4'
    this.desc = `版本 ${this.version}`

    this.registerAction('检查更新', this.actionUpdate)
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render () {
    let APIKey = args.widgetParameter
    let result, factionCrimesResult
    if (APIKey !== null) {
      const api = `https://api.torn.com/user/?selections=timestamp,basic,travel,cooldowns,bars,money,education&key=${APIKey}&comment=TornWidget`
      result = await this.httpGet(api, true, false)
      const factionCrimesApi = `https://api.torn.com/faction/?selections=crimes&key=${APIKey}&comment=TornWidget`
      factionCrimesResult = await this.httpGet(factionCrimesApi, true, false)
    } else {
       result = {"timestamp":1615639666,"level":25,"gender":"Male","player_id":2587304,"name":"microdust","server_time":1615639666,"points":36,"cayman_bank":0,"vault_amount":0,"daily_networth":5379662754,"money_onhand":600293,"education_current":61,"education_timeleft":1545972,"status":{"description":"Traveling to United Kingdom","details":"","state":"Traveling","color":"blue","until":0},"travel":{"destination":"United Kingdom","timestamp":1615644140,"departed":1615637300,"time_left":4474},"cooldowns":{"drug":27118,"medical":17393,"booster":13236},"happy":{"current":4938,"maximum":5025,"increment":5,"interval":900,"ticktime":734,"fulltime":16034},"life":{"current":685,"maximum":1181,"increment":70,"interval":300,"ticktime":134,"fulltime":2234},"energy":{"current":30,"maximum":150,"increment":5,"interval":600,"ticktime":134,"fulltime":13934},"nerve":{"current":15,"maximum":61,"increment":1,"interval":300,"ticktime":134,"fulltime":13634},"chain":{"current":0,"maximum":10000,"timeout":0,"modifier":1,"cooldown":0},"city_bank":{"amount":2436000000,"time_left":6732555},"education_completed":[14,18,19,20,34,43,44,45,46,47,48,49,50,51,52,54,112,113,126,127]}
       factionCrimesResult = {"crimes":{"8736509":{"crime_id":4,"crime_name":"Planned robbery","participants":[{"2587304":{"description":"Okay","details":"","state":"Okay","color":"green","until":0}},{"2459216":{"description":"Returning to Torn from United Kingdom","details":"","state":"Traveling","color":"blue","until":0}},{"2601348":{"description":"Okay","details":"","state":"Okay","color":"green","until":0}},{"2596088":{"description":"Returning to Torn from Argentina","details":"","state":"Traveling","color":"blue","until":0}},{"2515101":{"description":"Traveling to Argentina","details":"","state":"Traveling","color":"blue","until":0}}],"time_started":1615449927,"time_ready":1615795527,"time_left":248739,"time_completed":0,"initiated":0,"initiated_by":0,"planned_by":2515101,"success":0,"money_gain":0,"respect_gain":0}}}
    }
    const data = await this.parseData(result)
    const ocData = this.parseCrimes(factionCrimesResult, result.player_id)
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
    // 以375x667 pt作为最低适配分辨率，此时widget为148x148 pt，四分布局最小间距8 pt，因此每个正方形边长为70 pt
    const wMargin = 8
    const edgeLength = 70
    function addContainer(w) {
      w.addSpacer()
      const container = w.addStack()
      container.size = new Size(0, edgeLength)
      return container
    }
    function addSquare(container) {
      container.addSpacer()
      const square = container.addStack()
      square.size = new Size(edgeLength, edgeLength)
      return square
    }
    
    let w = new ListWidget()
    let topContainer = addContainer(w)
    let leftSquare = addSquare(topContainer)
    let rightSquare = addSquare(topContainer)
    topContainer.addSpacer()
    let bottomContainer = addContainer(w)
    bottomContainer.addSpacer()
    let bottomRect = bottomContainer.addStack()
    bottomRect.size = new Size(edgeLength * 2 + wMargin, edgeLength)
    bottomContainer.addSpacer()
    w.addSpacer()

    // debug
    // w.backgroundColor = Color.gray()
    // leftSquare.backgroundColor = Color.red()
    // rightSquare.backgroundColor = Color.green()
    // bottomRect.backgroundColor = Color.blue()

    // leftSquare
    leftSquare.layoutVertically()
    // centerAlignContent似乎仅针对水平布局的WidgetStack，垂直布局的WidgetStack无法让内容左右居中
    // leftSquare.centerAlignContent()
    function addTextToken(container, text, backgroundColor, left, right) {
      container.addSpacer()
      const cell = container.addStack()
      cell.size = new Size(container.size.width, 0)
      // cell.backgroundColor = Color.white()
      cell.addSpacer(left)
      const fontSize = 14
      const tokenFont = Font.lightSystemFont(fontSize)
      const tokenCornerRadius = 8
      let textToken = cell.addStack()
      textToken.size = new Size(0, tokenCornerRadius * 2)
      textToken.backgroundColor = backgroundColor
      textToken.cornerRadius = tokenCornerRadius
      textToken.addSpacer()
      let tokenText = textToken.addText(text)
      tokenText.lineLimit = 1
      tokenText.font = tokenFont
      textToken.addSpacer()
      cell.addSpacer(right)
    }
    switch (data[DataKeyStatus]) {
      case 'Abroard':
        addTextToken(leftSquare, 'abroard', Color.blue(), 3, 0)
        break;
      case 'Traveling':
        addTextToken(leftSquare, 'flying', Color.purple(), 3, 0)
        break;
      default:
        addTextToken(leftSquare, 'okay', Color.green(), 3, 0)
        break;
    }
    for (const key of [DataKeyEnergy, DataKeyNerve]) {
      const barColors = {
        energy: EnergyColor,
        nerve: NerveColor
      }
      const barData = data[key]
      let percent = barData.current / barData.maximum
      addTextToken(leftSquare, `${barData.current}/${barData.maximum}`, new Color(barColors[key], 1), 3, 0)
    }
    leftSquare.addSpacer()

    // rightSquare
    rightSquare.layoutVertically()
    for (const key of [DataKeyBank, DataKeyEducation, DataKeyOC]) {
      const names = {
        [DataKeyBank]: '🏦',
        [DataKeyEducation]: '🎓',
        [DataKeyOC]: 'OC '
      }
      console.log(data)
      const tokenBGColor = Color.dynamic(new Color('#ececec', 0.5), new Color('#333333', 0.5))
      let timeLeft = formatTimeLeft(data[key])
      addTextToken(rightSquare, `${names[key]}${timeLeft.value}${timeLeft.unit[0]}`, tokenBGColor, 0, 4)
    }
    rightSquare.addSpacer()

    // bottomRect放置各种cooldowns
    bottomRect.layoutVertically()
    const keys = [DataKeyTravel, DataKeyDrug, DataKeyBooster, DataKeyMedical]
    for (const key of keys) {
      if (!data[key]) continue
      const cell = bottomRect.addStack()
      cell.centerAlignContent()
      cell.addSpacer(4)
      let value = data[key]
      // cooldowns
      const fontSize = 12
      if (useSFSymbol) {
        let symbol = SFSymbol.named(sfNames[key])
        let wImage = cell.addImage(symbol.image)
        wImage.imageSize = new Size(fontSize, fontSize)
        wImage.tintColor = Color.dynamic(new Color('#000000', 1), new Color('#ffffff', 1))
      } else {
        cell.addText(cooldownsChar[key]).font = thisFont
      }
      let dateBox = cell.addStack()
      dateBox.addText(` @ ${formatHHMM(value)}`).font = thisFont
      let timerBox = cell.addStack()
      timerBox.addText(` in `).font = thisFont
      let timer = timerBox.addDate(value)
      timer.font = thisFont
      timer.applyTimerStyle()
    }

    return w
  }
  /**
   * 渲染中尺寸组件
   */
  async renderMedium (data, keys = [DataKeyTravel, DataKeyDrug, DataKeyBooster, DataKeyMedical]) {
    let w = new ListWidget()
    await this.renderHeader(w, null, 'TORN CITY')
    for (const key of keys) {
      if (!data[key]) continue
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
        if (useSFSymbol) {
          let symbol = SFSymbol.named(sfNames[key])
          let wImage = cell.addImage(symbol.image)
          wImage.imageSize = new Size(fontSize, fontSize)
          wImage.tintColor = Color.dynamic(new Color('#000000', 1), new Color('#ffffff', 1))
        } else {
          cell.addText(cooldownsChar[key]).font = thisFont
        }
        cell.addText(` @ `).font = thisFont
        let dueDate = cell.addDate(value)
        dueDate.font = thisFont
        dueDate.applyTimeStyle()
        cell.addText(` in `).font = thisFont
        let timer = cell.addDate(value)
        timer.font = thisFont
        timer.applyTimerStyle()
      } else if (typeof value === 'number') {
        let timeLeft = formatTimeLeft(value)
        let text
        switch (key) {
          case DataKeyBank:
            if (timeLeft) {
              text = `will expire in ${timeLeft.value} ${timeLeft.unit}`
            } else {
              text = 'has expired'
            }
            break;
          case DataKeyEducation:
            if (timeLeft) {
              text = `will end in ${timeLeft.value} ${timeLeft.unit}`
            } else {
              text = 'has ended'
            }
            break;
          case DataKeyOC:
            if (timeLeft) {
              text = `will be ready in ${timeLeft.value} ${timeLeft.unit}`
            } else {
              text = 'has been ready'
            }
            break;
          default:
            break;
        }
        const cell_text = cell.addText(`${key}: ${text}`)
        cell_text.font = thisFont
      } else {
        // bars
        const barColors = {
          energy: EnergyColor,
          nerve: NerveColor
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
    const footerData = {
      ['Data@']: new Date(data[DataKeyTimestamp] * 1000),
      ['Widget@']: new Date()
    }
    let footer = w.addStack()
    footer.centerAlignContent()
    let symbol = SFSymbol.named('arrow.clockwise')
    let refresh = footer.addImage(symbol.image)
    refresh.imageSize = new Size(fontSize, fontSize)
    refresh.tintColor = Color.dynamic(new Color('#000000', 1), new Color('#ffffff', 1))
    for (const key in footerData) {
      footer.addSpacer(textSpacerLenght)
      footer.addText(key).font = thisFont
      let updateDate = footer.addDate(footerData[key])
      updateDate.font = thisFont
      updateDate.applyRelativeStyle()
    }
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
    const keys = [
      DataKeyStatus, 
      DataKeyEnergy, 
      DataKeyNerve, 
      DataKeyTravel, 
      DataKeyDrug, 
      DataKeyBooster, 
      DataKeyMedical,
      DataKeyBank,
      DataKeyEducation,
      DataKeyOC
    ]
    return await this.renderMedium(data, keys)
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
    let result = { [DataKeyTimestamp]: timestamp, [DataKeyStatus]: status.state, [DataKeyEnergy]: energy, [DataKeyNerve]: nerve }
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
      result[DataKeyBank] = city_bank.time_left
    }
    // edu
    if (typeof education_timeleft !== 'undefined') {
      result[DataKeyEducation] = education_timeleft
    }
    async function scheduleNotification(options, triggerDate) {
      const { identifier } = options
      await Notification.removePending([identifier])
      let n = new Notification()
      n.openURL = 'alook://'
      n.sound = 'default'
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
      return { [DataKeyOC]: time_left }
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

  async actionUpdate() {
    let name = Script.name()
    const fileName = `${name}.js`
    if (name.endsWith('.dist')) {
      name = name.substr(0, name.length - 5)
    }
    let manifestURL = `https://raw.githubusercontent.com/Fitzmaz/Scriptables/v2-dev/Dist/${name}/manifest.json?_=${Date.now()}`
    const manifestReq = new Request(manifestURL)
    console.log('开始检查更新')
    const manifest = await manifestReq.loadJSON().catch((err) => { console.error(`检查更新发生错误: ${err}`) })
    if (!manifest) return
    if (manifest['version'] == this.version) {
      console.log('当前版本已经是最新')
      return
    }
    let alert = new Alert()
    alert.message = `新版本 ${manifest.version} 是否更新`
    alert.addAction('是')
    alert.addAction('否')
    let response = await alert.presentAlert()
    if (response == 1) return
    console.log('开始下载更新')
    const REMOTE_REQ = new Request(`https://raw.githubusercontent.com/Fitzmaz/Scriptables/v2-dev/Dist/${name}/${name}-${manifest.version}.js`)
    const REMOTE_RES = await REMOTE_REQ.load().catch((err) => { console.error(`下载更新发生错误: ${err}`) })
    if (!REMOTE_RES) return
    if (REMOTE_REQ.response.statusCode !== 200) {
      console.log('下载更新失败')
      return
    }
    console.log('开始写入更新')
    const FILE_MGR = FileManager[global.module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']()
    FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), fileName), REMOTE_RES)
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

const { Running, Testing } = require("./「小件件」开发环境")
if (typeof DEBUG !== 'undefined' && DEBUG === true) {
  await Testing(Widget)
} else {
  if (config.runsWithSiri) {
    const M = new Widget(null)
    const w = await M.render()
    // widget偶现错误信息，原因不明，先给所有分支加上setWidget
    // Call Script.setWidget() to set the content of the widget.
    Script.setWidget(w)
    Script.complete()
  } else {
    await Running(Widget)
  }
}
