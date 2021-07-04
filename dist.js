const process = require('process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const sourceFolder = process.argv[2]
const distFolder = 'Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents'

if (fs.existsSync(sourceFolder)) {
  const sourceFiles = fs.readdirSync(sourceFolder)
  for (const fileName of sourceFiles) {
    const filePath = path.resolve(__dirname, sourceFolder, fileName)
    const destPath = path.resolve(os.homedir(), distFolder, fileName)
    fs.copyFileSync(filePath, destPath)
  }
}
