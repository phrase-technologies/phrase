#!/usr/bin/env node
var shell = require('shelljs')
var prompt = require('prompt')
var chalk = require('chalk')
var mkdirp = require('mkdirp')
var fs = require('fs')

function onErr(err) {
  console.log(err)
  return 1
}

var prompts = [
  {
    description: chalk.yellow(`What's the unique id of your plugin`),
    type: 'string',
    required: true,
    name: 'id',
  },
  {
    description: chalk.cyan('What is the display title of your plugin?'),
    type: 'string',
    required: true,
    name: 'title',
  },
  {
    description: chalk.green('What is your plugins description?'),
    type: 'string',
    required: true,
    name: 'description',
  }
]

var clientFiles = {
  config: 'enclave.js'
}

function configureConfigFile(err, result) {
  if (err) return onErr(err)

  mkdirp(`src/plugins/${result.id}`, err => {
    if (err) console.error(err)

    // Generate Interface File

    fs.writeFile(`src/plugins/${result.id}/${result.id}Interface.js`,
`import React from 'react'

let ${result.id}Interface = ({ config, update }) => {
  return (
    <div id="Plugin__${result.id}">
      ${result.title}
    </div>
  )
}

export default ${result.id}Interface`,
      err => {
        if (err) return console.log(err)
        console.log(chalk.yellow(`Interface File Created`))
      }
    )

    // Generate Source File

    fs.writeFile(`src/plugins/${result.id}/${result.id}Source.js`,
`class ${result.id}Source {
  constructor(AudioContext, config) {
    this.ctx = AudioContext
    this.input = this.ctx.createGain()
    this.output = this.ctx.createGain()
  }

  getInputNode() {
    this.input
  }

  update(config) {

  }

  connect(target) {
    this.outputGain.connect(target)
  }
}

export default ${result.id}Source`,
      err => {
        if (err) return console.log(err)
        console.log(chalk.yellow(`Source File Created`))
      }
    )

    // Generate Metadata File

    fs.writeFile(`src/plugins/${result.id}/${result.id}Meta.js`,
`export default {
  id: '${result.id}',
  title: '${result.title}',
  description: '${result.description}',
  config: {
    // your default settings here
  }
}`,
      err => {
        if (err) return console.log(err)
        console.log(chalk.yellow(`Metadata File Created`))
      }
    )
  })
}

prompt.get(prompts, configureConfigFile)
