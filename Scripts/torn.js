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

const { Base } = require("./「小件件」开发环境")

// @组件代码开始

const storage = require('./storage')
const { createTableRows } = require('./DrugAddiction')

// constants
const DataKeyTimestamp = 'timestamp'
const DataKeyStatus = 'status'
const UserStatusStateHospital = 'Hospital'
const UserStatusStateTraveling = 'Traveling'
const UserStatusStateAbroad = 'Abroad'
const DataKeyEnergy = 'energy'
const DataKeyNerve = 'nerve'
const DataKeyDrugAddictionPoints = 'dap'
const DataKeyTravel = 'travel'
const DataKeyDrug = 'drug'
const DataKeyBooster = 'booster'
const DataKeyMedical = 'medical'
const DataKeyBank = 'bank'
const DataKeyEducation = 'education'
const DataKeyOC = 'oc'
const DataKeyPI = 'pi'
const DataKeyEnergyRefills = 'refills.energy'
const DataKeyNerveRefills = 'refills.nerve'
const DataKeyTokenRefills = 'refills.token'
const DataKeyRacing = 'racing'
const sfNames = {
  [DataKeyTravel]: 'airplane',
  [DataKeyDrug]: 'pills.fill',
  [DataKeyBooster]: 'shift.fill',
  [DataKeyMedical]: 'cross.case.fill',
  [DataKeyRacing]: 'car.fill'
}
const cooldownsChar = {
  [DataKeyTravel]: '飞',
  [DataKeyDrug]: '药',
  [DataKeyBooster]: '酒',
  [DataKeyMedical]: '医',
  [DataKeyRacing]: '车'
}
const DaysLeftForever = 999
const RacingStatusWaiting = 'RacingStatusWaiting'
const RacingStatusRacing = 'RacingStatusRacing'
const RacingStatusFinished = 'RacingStatusFinished'
const RacingStatusNone = 'RacingStatusNone'

const PropertyTypePrivateIsland = 13

const useSFSymbol = true

// UX
const fontSize = 14
const thisFont = Font.regularSystemFont(fontSize)
const textSpacerLenght = 4
const EnergyColor = '#4d7c1e'
const NerveColor = '#b3382c'
const tokenBGColor = Color.dynamic(new Color('#ececec', 0.5), new Color('#333333', 0.5))
const tokenCornerRadius = 8

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

// UI
// 以375x667 pt作为最低适配分辨率，此时widget为148x148 pt，四分布局最小间距8 pt，因此每个正方形边长为70 pt
const wMargin = 8
const wBlockEdgeLength = 70
const wSmallEdgeLength = wMargin + wBlockEdgeLength * 2
class TokenOption {
  constructor(text, textColor, backgroundColor) {
    this.text = text
    this.textColor = textColor
    this.backgroundColor = backgroundColor
  }
}
function addTextToken(parent, tokenOption) {
  const { text, textColor, backgroundColor } = tokenOption
  const fontSize = 14
  const tokenFont = Font.semiboldSystemFont(fontSize)
  let textToken = parent.addStack()
  textToken.size = new Size(0, tokenCornerRadius * 2)
  textToken.backgroundColor = backgroundColor
  textToken.cornerRadius = tokenCornerRadius
  textToken.addSpacer()
  let tokenText = textToken.addText(text)
  if (textColor) {
    tokenText.textColor = textColor
  }
  tokenText.lineLimit = 1
  tokenText.font = tokenFont
  tokenText.minimumScaleFactor = 0.8
  textToken.addSpacer()
  return textToken
}
function renderTokenStack(parent, tokenOptions, paddingLeft, paddingRight) {
  for (const option of tokenOptions) {
    const cell = parent.addStack()
    cell.size = new Size(parent.size.width, 0)
    // debug
    // cell.backgroundColor = Color.white()
    cell.addSpacer(paddingLeft)
    addTextToken(cell, option)
    cell.addSpacer(paddingRight)
  }
}
class CountdownOption {
  constructor(date, symbolName, glyph) {
    this.date = date
    this.symbolName = symbolName
    this.glyph = glyph
  }
}
function addCountdown(parent, countdownOption) {
  const cell = parent.addStack()
  cell.centerAlignContent()
  cell.addSpacer(4)
  const { date, symbolName, glyph } = countdownOption
  if (useSFSymbol) {
    let symbol = SFSymbol.named(symbolName)
    let wImage = cell.addImage(symbol.image)
    const fontSize = 10
    wImage.imageSize = new Size(fontSize, fontSize)
    wImage.tintColor = Color.dynamic(new Color('#000000', 1), new Color('#ffffff', 1))
  } else {
    cell.addText(glyph).font = thisFont
  }
  let dateBox = cell.addStack()
  let dateBoxText = dateBox.addText(` @ ${formatHHMM(date)}`)
  dateBoxText.font = thisFont
  dateBoxText.lineLimit = 1
  let timerBox = cell.addStack()
  let timerBoxText = timerBox.addText(` in `)
  timerBoxText.font = thisFont
  timerBoxText.lineLimit = 1
  let timer = timerBox.addDate(date)
  timer.font = thisFont
  timer.lineLimit = 1
  timer.applyTimerStyle()
  return cell
}

function addContainerV(parent, height) {
  parent.addSpacer()
  const container = parent.addStack()
  container.size = new Size(0, height)
  container.setPadding(0, -wMargin, 0, -wMargin)
  return container
}
function addContainerH(parent, width) {
  parent.addSpacer()
  const container = parent.addStack()
  container.size = new Size(width, 0)
  return container
}
function addSquare(parent, edgeLength) {
  parent.addSpacer()
  const container = parent.addStack()
  container.size = new Size(edgeLength, edgeLength)
  return container
}

class Widget extends Base {
  /**
   * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
   * @param {string} arg 自定义参数
   */
  constructor(arg) {
    super(arg)
    this.name = 'TORN 小组件'
    this.version = '0.1.11'
    this.desc = `版本 ${this.version}`
    this.track('run')
  }

  track(action, uid) {
    const PlayerIDKey = 'PlayerIDKey'
    if (uid) {
      storage.set(PlayerIDKey, uid)
      super.track(action, uid)
    } else {
      const playerID = storage.get(PlayerIDKey)
      if (playerID) {
        super.track(action, uid)
      }
    }
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    let APIKey = this.arg
    let result
    let piDaysLeft
    let drugAddictionPoints
    if (typeof APIKey === 'string' && APIKey.length > 0) {
      const api = `https://api.torn.com/user/?selections=timestamp,basic,travel,cooldowns,bars,money,education,refills,icons&key=${APIKey}&comment=TornWidget`
      result = await this.httpGet(api, true, false)
      piDaysLeft = await this.getPIDaysLeft(APIKey)
      drugAddictionPoints = await this.getDrugAddictionPoints(APIKey).catch(err => { console.log(`Get addiction failed. ${err}`) })
    } else {
      result = {"timestamp":1615639666,"level":25,"gender":"Male","player_id":1,"name":"microdust","server_time":1615639666,"points":36,"cayman_bank":0,"vault_amount":0,"daily_networth":5379662754,"money_onhand":600293,"education_current":61,"education_timeleft":1545972,"status":{"description":"Traveling to United Kingdom","details":"","state":"Traveling","color":"blue","until":0},"travel":{"destination":"United Kingdom","timestamp":1615644140,"departed":1615637300,"time_left":4474},"cooldowns":{"drug":27118,"medical":17393,"booster":13236},"happy":{"current":4938,"maximum":5025,"increment":5,"interval":900,"ticktime":734,"fulltime":16034},"life":{"current":685,"maximum":1181,"increment":70,"interval":300,"ticktime":134,"fulltime":2234},"energy":{"current":30,"maximum":150,"increment":5,"interval":600,"ticktime":134,"fulltime":13934},"nerve":{"current":15,"maximum":61,"increment":1,"interval":300,"ticktime":134,"fulltime":13634},"chain":{"current":0,"maximum":10000,"timeout":0,"modifier":1,"cooldown":0},"city_bank":{"amount":2436000000,"time_left":6732555},"education_completed":[14,18,19,20,34,43,44,45,46,47,48,49,50,51,52,54,112,113,126,127],"refills":{"energy_refill_used":true,"nerve_refill_used":false,"token_refill_used":false,"special_refills_available":0},"icons":{"icon6":"Male","icon4":"Subscriber - Donator status: 92 days - Subscriber until: 24/08/21","icon8":"Married - To Trefor","icon29":"Bank Investment - Current bank investment worth $3,639,000,000 - 60 days, 23 hours, 34 minutes and 39 seconds","icon27":"Company - Chandler of Lead Farmers (Candle Shop)","icon9":"Faction - Karajan of November Chopin","icon19":"Education - Currently completing the Bachelor of Psychological Sciences course - 26 days, 9 hours, 9 minutes and 58 seconds","icon38":"Stock Market - You own shares in the stock market","icon85":"Organized Crime - Planned Robbery - 3 days, 15 hours, 47 minutes and 0 seconds","icon39":"Booster Cooldown - 01:24:28 / 24:00:00","icon52":"Drug Cooldown - Under the influence of Xanax - 03:03:50 ","icon78":"Property Upkeep war - $21,755,000 is due in property upkeep","icon17":"Racing - Waiting for a race to start - 00:58:29"}}
      result.timestamp = Math.floor(Date.now() / 1000)
      piDaysLeft = DaysLeftForever
    }
    const { player_id } = result
    if (player_id) {
      this.track('render', player_id)
    }
    const data = await this.parseData(result)
    data[DataKeyPI] = piDaysLeft * 60 * 60 * 24
    if (drugAddictionPoints) {
      data[DataKeyDrugAddictionPoints] = drugAddictionPoints
    }
    const w = new ListWidget()
    switch (this.widgetFamily) {
      case 'large':
        await this.renderLarge(w, data)
        break
      case 'medium':
        this.renderMedium(w, data)
        break
      default:
        this.renderSmall(w, data)
    }
    return w
  }

  /**
   * 渲染小尺寸组件
   */
  renderSmall(parent, data) {
    // parent必须为ListWidget或垂直布局的WidgetStack
    let leftTokenOptions = []
    switch (data[DataKeyStatus]) {
      case UserStatusStateAbroad:
        leftTokenOptions.push(new TokenOption('abroad', new Color('#ececec', 1), Color.blue()))
        break;
      case UserStatusStateTraveling:
        leftTokenOptions.push(new TokenOption('flying', new Color('#ececec', 1), Color.purple()))
        break;
      case UserStatusStateHospital:
        leftTokenOptions.push(new TokenOption('hosp', new Color('#ececec', 1), Color.red()))
        break;
      default:
        leftTokenOptions.push(new TokenOption('okay', new Color('#ececec', 1), Color.green()))
        break;
    }
    for (const key of [DataKeyEnergy, DataKeyNerve]) {
      const barColors = {
        energy: EnergyColor,
        nerve: NerveColor
      }
      const barData = data[key]
      leftTokenOptions.push(new TokenOption(`${barData.current}/${barData.maximum}`, new Color('#ececec', 1), new Color(barColors[key], 1)))
    }
    if (data[DataKeyDrugAddictionPoints]) {
      leftTokenOptions.push(new TokenOption(`${data[DataKeyDrugAddictionPoints]}`, new Color('#ececec', 1), new Color('#6cadde', 1)))
    } else {
      //TODO: refill放到其他位置
      leftTokenOptions.push(new TokenOption(`refill:${data[DataKeyEnergyRefills]}`, new Color('#ececec', 1), new Color('#6cadde', 1)))
    }
    //
    let rightTokenOptions = []
    for (const key of [DataKeyBank, DataKeyEducation, DataKeyOC, DataKeyPI]) {
      if (!data[key]) continue
      const names = {
        [DataKeyBank]: '🏦',
        [DataKeyEducation]: '🎓',
        [DataKeyOC]: 'OC ',
        [DataKeyPI]: 'PI '
      }
      let timeLeftObject = formatTimeLeft(data[key])
      let timeLeftString
      if (timeLeftObject) {
        if (timeLeftObject.value === DaysLeftForever) {
          timeLeftString = ' ∞'
        } else {
          timeLeftString = `${timeLeftObject.value}${timeLeftObject.unit[0]}`
        }
      } else {
        timeLeftString = `now`
      }
      rightTokenOptions.push(new TokenOption(`${names[key]}${timeLeftString}`, null, tokenBGColor))
    }
    //
    let countdownOptions = []
    const keys = [DataKeyTravel, DataKeyRacing, DataKeyDrug, DataKeyBooster, DataKeyMedical]
    for (const key of keys) {
      if (!data[key]) continue
      let value = data[key]
      // cooldowns
      const symbolName = sfNames[key]
      const glyph = cooldownsChar[key]
      countdownOptions.push(new CountdownOption(value, symbolName, glyph))
    }

    let topContainer = addContainerV(parent, wBlockEdgeLength)
    let leftSquare = addSquare(topContainer, wBlockEdgeLength)
    let rightSquare = addSquare(topContainer, wBlockEdgeLength)
    topContainer.addSpacer()
    let bottomContainer = addContainerV(parent, wBlockEdgeLength)
    bottomContainer.addSpacer()
    let bottomRect = bottomContainer.addStack()
    bottomRect.size = new Size(wSmallEdgeLength, wBlockEdgeLength)
    bottomRect.cornerRadius = tokenCornerRadius
    bottomRect.backgroundColor = tokenBGColor
    bottomContainer.addSpacer()
    parent.addSpacer()

    // debug
    // topContainer.backgroundColor = Color.white()
    // bottomContainer.backgroundColor = Color.black()
    // leftSquare.backgroundColor = Color.red()
    // rightSquare.backgroundColor = Color.green()

    // leftSquare
    leftSquare.layoutVertically()
    leftSquare.addSpacer()
    renderTokenStack(leftSquare, leftTokenOptions, 3, 0)
    leftSquare.addSpacer()

    // rightSquare
    rightSquare.layoutVertically()
    rightSquare.addSpacer()
    renderTokenStack(rightSquare, rightTokenOptions, 0, 4)
    rightSquare.addSpacer()

    // bottomRect放置各种cooldowns
    bottomRect.layoutVertically()
    for (const option of countdownOptions) {
      addCountdown(bottomRect, option)
    }
  }
  renderMedium(parent, data) {
    const container = parent.addStack()
    const left = addContainerH(container, wSmallEdgeLength)
    left.layoutVertically()
    const right = addContainerH(container, wSmallEdgeLength)
    right.layoutVertically()
    container.addSpacer()
    this.renderSmall(left, data)

    let leftTokenOptions = []
    leftTokenOptions.push(new TokenOption('refills', null, tokenBGColor))
    for (const key of [DataKeyEnergyRefills, DataKeyNerveRefills, DataKeyTokenRefills]) {
      if (typeof data[key] === 'undefined') continue
      const names = {
        [DataKeyEnergyRefills]: 'ener',
        [DataKeyNerveRefills]: 'nerv',
        [DataKeyTokenRefills]: 'toke',
      }
      leftTokenOptions.push(new TokenOption(`${names[key]}:${data[key]}`, null, tokenBGColor))
    }

    let rightTokenOptions = []
    for (let i = 0; i < 4; i++) {
      rightTokenOptions.push(new TokenOption('', null, tokenBGColor))
    }

    let topContainer = addContainerV(right, wBlockEdgeLength)
    let leftSquare = addSquare(topContainer, wBlockEdgeLength)
    let rightSquare = addSquare(topContainer, wBlockEdgeLength)
    topContainer.addSpacer()
    let bottomContainer = addContainerV(right, wBlockEdgeLength)
    bottomContainer.addSpacer()
    let bottomRect = bottomContainer.addStack()
    bottomRect.size = new Size(wSmallEdgeLength, wBlockEdgeLength)
    bottomRect.cornerRadius = tokenCornerRadius
    bottomRect.backgroundColor = tokenBGColor
    bottomContainer.addSpacer()
    right.addSpacer()

    // debug
    // container.backgroundColor = Color.cyan()
    // left.backgroundColor = Color.gray()
    // right.backgroundColor = Color.gray()

    // leftSquare
    leftSquare.layoutVertically()
    leftSquare.addSpacer()
    renderTokenStack(leftSquare, leftTokenOptions, 3, 0)
    leftSquare.addSpacer()

    // rightSquare
    rightSquare.layoutVertically()
    rightSquare.addSpacer()
    renderTokenStack(rightSquare, rightTokenOptions, 0, 4)
    rightSquare.addSpacer()

    // bottomRect放置各种cooldowns
    // bottomRect.layoutVertically()
    // for (const option of countdownOptions) {
    //   addCountdown(bottomRect, option)
    // }
  }
  /**
   * 渲染中尺寸组件
   */
  async _renderMedium(data, keys = [DataKeyTravel, DataKeyDrug, DataKeyBooster, DataKeyMedical]) {
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
  async renderLarge(w, data) {
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
    return await this._renderMedium(data, keys)
  }

  async fetchAPI(path, params) {
    params.comment = 'TornWidget'
    let query = Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
    let url = `https://api.torn.com/${path}?${query}`
    const data = await this.httpGet(url, true, false)
    if (data.error) {
      let { code, error } = data.error;
      throw new Error(`API error ${code} ${error}`)
    }
    return data
  }
  async getPIDaysLeft(APIKey) {
    const PropertyDataKey = 'PropertyDataKey'
    const propertyData = storage.getJSON(PropertyDataKey)
    // 存在缓存数据且时间不超过1天，直接返回缓存数据
    if (propertyData && Date.now() - propertyData.timestamp < 1000 * 60 * 60 * 24) {
      return propertyData.days
    }
    const data = await this.fetchAPI('property', {
      selections: 'property',
      key: APIKey,
    })
    if (!data || !data.property || !data.property.property_type || !data.property.rented) {
      console.warn('invalid property data')
      return
    }
    const { property_type, rented } = data.property
    let days
    if (property_type === PropertyTypePrivateIsland) {
      // 自购PI的rented.days_left值为""
      days = typeof rented.days_left === 'string' ? DaysLeftForever : rented.days_left
    }
    storage.setJSON(PropertyDataKey, { days, timestamp: Date.now() })
    return days
  }
  async getDrugAddictionPoints(APIKey) {
    const drugs = await this.fetchAPI('user', {
      selections: 'log',
      cat: '61',
      key: APIKey,
    }).catch(err => { throw err })
    const logs = Object.values(drugs.log).sort((a, b) => b.timestamp - a.timestamp)
    const LogTypeRehab = 6005
    const rehabLogs = logs.filter(record => record.log === LogTypeRehab)
    const drugLogs = logs.filter(record => record.log !== LogTypeRehab)
    console.log('drug addiction points resolving.')
    const rows = createTableRows(rehabLogs, drugLogs)
    if (!rows.length) { throw new Error('createTableRows return empty') }
    const { points } = rows.pop()
    console.log(`drug addiction points resolved ${points}`)
    return points
  }
  /**
   * 获取数据函数，函数名可不固定
   */
  async parseData(data) {
    // timestamp,basic,travel,cooldowns
    let { timestamp, cooldowns, status, travel } = data
    // bars
    let { energy, nerve, happy, life, chain } = data
    // bank,edu
    let { city_bank, education_timeleft } = data
    let result = { [DataKeyTimestamp]: timestamp, [DataKeyStatus]: status.state, [DataKeyEnergy]: energy, [DataKeyNerve]: nerve }
    // travel
    if (status.state === 'Traveling') {
      let { destination, time_left } = travel
      let travelDate = formatCooldown(timestamp, time_left)
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
      // medical不通知
      if (key === DataKeyMedical) {
        continue
      }
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
    // refills
    let { refills } = data
    if (refills) {
      const { energy_refill_used, nerve_refill_used, token_refill_used, special_refills_available } = refills
      if (typeof energy_refill_used !== 'undefined' && typeof special_refills_available !== 'undefined') {
        let r = Number(special_refills_available)
        if (!energy_refill_used) {
          r += 1
        }
        result[DataKeyEnergyRefills] = r
      }
      if (typeof nerve_refill_used !== 'undefined') {
        result[DataKeyNerveRefills] = nerve_refill_used ? 0 : 1
      }
      if (typeof token_refill_used !== 'undefined') {
        result[DataKeyTokenRefills] = token_refill_used ? 0 : 1
      }
    }
    // icons
    let { icons } = data
    if (icons.icon85) {
      // Organized Crime - Planned Robbery - 3 days, 15 hours, 49 minutes and 59 seconds
      result[DataKeyOC] = parseIconTimeLeft(icons.icon85)
    } else {
      result[DataKeyOC] = 0
    }
    if (icons.icon17) {
      // Racing - Waiting for a race to start - 00:25:31
      // Racing - Currently racing - 00:04:35
      // 新版剩余时间格式与OC统一
      // Racing - Waiting for a race to start - 0 days, 0 hours, 56 minutes and 9 seconds
      let status = icons.icon17.toLowerCase().indexOf('wait') ? RacingStatusWaiting : RacingStatusRacing
      let timeLeft = parseIconTimeLeft(icons.icon17)
      if (timeLeft) {
        result[DataKeyRacing] = formatCooldown(timestamp, timeLeft)
      }
    } else if (icons.icon18) {
      // Racing - You finished 4th in the Stone Park race. Your best lap was 01:15.73
      result[DataKeyRacing] = null
    } else {
      result[DataKeyRacing] = null
    }
    function parseIconTimeLeft(iconString) {
      // 3 days, 15 hours, 49 minutes and 59 seconds
      let matches = iconString.match(/\d+ \w+/g)
      if (matches !== null && matches.length > 0) {
        return matches.reduce((acc, val) => {
          let components = val.split(' ')
          let time = Number(components[0])
          let unit = components[1]
          if (unit === 'days') {
            return acc + time * 60 * 60 * 24
          } else if (unit === 'hours') {
            return acc + time * 60 * 60
          } else if (unit === 'minutes') {
            return acc + time * 60
          } else if (unit === 'seconds') {
            return acc + time
          } else {
            return acc
          }
        }, 0)
      }
      // 00:25:31
      matches = iconString.match(/\d{2}:\d{2}:\d{2}/g)
      if (matches !== null && matches.length > 0) {
        let hhmmss = matches[0]
        let components = hhmmss.split(':')
        return components[0] * 3600 + components[1] * 60 + Number(components[2])
      }
      return 0
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
}
// @组件代码结束
