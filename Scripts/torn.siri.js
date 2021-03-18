const TornSiriThreadIdentifier = 'torn.siri'

function fakeToast(message) {
  let n = new Notification()
  n.title = 'TORN'
  n.body = message
  n.threadIdentifier = TornSiriThreadIdentifier
  n.schedule()
}

async function httpGet(url, json = true) {
  let data = null
  try {
    let req = new Request(url)
    data = await (json ? req.loadJSON() : req.loadString())
  } catch (e) { }
  return data
}

async function parseData(data) {
  const DataKeyDrug = 'drug'
  const DataKeyBooster = 'booster'
  const DataKeyMedical = 'medical'
  // timestamp,basic,travel,cooldowns
  let { timestamp, cooldowns, status, travel } = data
  // travel
  if (status.state === 'Traveling') {
    let { destination, timestamp } = travel
    let travelDate = new Date(timestamp * 1000)
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
    let cooldownDate = getCooldownDate(timestamp, cooldowns[key])
    // setup notification
    await scheduleNotification({
      identifier: `torn.cooldowns.${key}`,
      title: 'Torn Cooldowns',
      body: `Here is your ${key} cooldown reminder!`
    }, cooldownDate)
  }
  function getCooldownDate(timestamp, timeleft) {
    return new Date((timestamp + timeleft) * 1000)
  }
  async function scheduleNotification(options, triggerDate) {
    const { identifier } = options
    await Notification.removePending([identifier])
    let n = new Notification()
    n.sound = 'default'
    n.threadIdentifier = TornSiriThreadIdentifier
    n = Object.assign(n, options)
    n.setTriggerDate(triggerDate)
    await n.schedule()
  }
}

; (async () => {
  let APIKey = args.shortcutParameter
  if (!APIKey || typeof APIKey !== 'string') {
    let message = '缺少APIKey'
    fakeToast(message)
    return
  }
  const api = `https://api.torn.com/user/?selections=timestamp,basic,travel,cooldowns,bars,money,education&key=${APIKey}`
  const result = await httpGet(api, true)
  await parseData(result)
  let message = `通知设置成功${APIKey}`
  fakeToast(message)
})();

Script.complete()
