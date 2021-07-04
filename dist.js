const fs = require('fs')
const path = require('path')
const os = require('os')

const sourceFolder = 'Scripts'
const distFolder = 'Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents'

const sourceFiles = fs.readdirSync(sourceFolder)
for (const fileName of sourceFiles) {
  const filePath = path.resolve(__dirname, sourceFolder, fileName)
  const destPath = path.resolve(os.homedir(), distFolder, fileName)
  fs.copyFileSync(filePath, destPath)
}
