module.exports = {
  set(key, value) {
    Keychain.set(key, value)
  },
  get(key) {
    if (!Keychain.contains(key)) {
      return null
    }
    return Keychain.get(key)
  },
  remove(key) {
    if (Keychain.contains(key)) {
      Keychain.remove(key)
    }
  },
  setJSON(key, value) {
    this.set(key, JSON.stringify(value))
  },
  getJSON(key) {
    let value
    try {
      value = JSON.parse(this.get(key))
    } catch (error) {
      return null
    }
    return value
  },
}
