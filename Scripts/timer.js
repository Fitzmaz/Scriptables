const timer = {
  _timers: {},
  _currentID: 0,
  _addTimer(timeInterval, repeat, callback) {
    const timer = new Timer()
    timer.repeats = repeat
    timer.timeInterval = timeInterval
    this._timers[++this._currentID] = timer
    timer.schedule(callback)
    return this._currentID
  },
  _removeTimer(timerID) {
    const timer = this._timers[timerID]
    if (timer) {
      timer.invalidate()
      delete this._timers[timerID]
    }
  },
  setTimeout(callback, ms) {
    return this._addTimer(ms, false, callback)
  },
  clearTimeout(timeoutID) {
    this._removeTimer(timeoutID)
  },
  setInterval(callback, ms) {
    return this._addTimer(ms, true, callback)
  },
  clearInterval(intervalID) {
    this._removeTimer(intervalID)
  },
}

module.exports = timer
