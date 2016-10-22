
import fs from 'fs'
import path from 'path'
import opener from 'opener'

import renderEmail from '../../src/helpers/renderEmail'

let baseDir = `scripts/email`

let main = async (args) => {
  try {
    let template = args[0]
    if (!template) {
      console.log(`Please provide a template name`)
      return
    }

    let templateDir = path.resolve(`templates`, `templates`, `${template}`)
    if (!fs.existsSync(templateDir)) {
      console.log(`Template directory not found: ${templateDir}`)
      return
    }

    let dataFile = path.resolve(baseDir, `test-data`, `${template}.json`)
    if(!fs.existsSync(dataFile)) {
      console.log(`Please create the following data file: ${dataFile}`)
      return
    }

    let outputFile = path.resolve(baseDir, `output`, `${template}_${Date.now()}.html`)
    let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    let html = await renderEmail({ template, data })
    fs.writeFileSync(outputFile, html)
    opener(outputFile)

    console.log(`html email written to ${outputFile}`)
  }
  catch (e) {
    console.log(e)
  }
}

main(process.argv.slice(2))
