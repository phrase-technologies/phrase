/* global process, require */

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import r from 'rethinkdb'
import chalk from 'chalk'
import { secret } from './config'
import socketIO from 'socket.io'
import { Server } from 'http'
import router from './router'
import { setupDatabase, setupSocketConnection, getNewMigrations } from './setup'

async function bootstrap () {
  try {
    console.log(chalk.yellow("⌛ Bootstrapping express server..."))

    let db = await r.connect({ host: `localhost`, db: `phrase`, port: 28015 })

    try { await setupDatabase({ name: `phrase`, db }) }
    catch (err) {
      let msg = err.msg || err
      console.log("❌", chalk.red(msg))
      if (msg !== `Database \`phrase\` already exists.`)
        process.exit() // Can't continue if we couldn't set up the database
      else {
        let migrations = await getNewMigrations({ db })
        if (migrations.length) {
          console.log("❌", chalk.red(
            `There are pending migrations, please use 'npm run migrate <<script>>' and try again.`
          ))
          await migrations.forEach(scriptName => {
            console.log(chalk.red(`  - ${scriptName}`))
          })
          process.exit() // Don't continue if there are pending migrations
        }
      }
    }

    let app = express()
    let server = Server(app)
    let io = socketIO(server)

    setupSocketConnection({ io, db })

    let port = process.env.PORT || 5000

    app.set(`superSecret`, secret)

    app.use(cors())
    app.use(express.static(`sounds`))
    app.use(express.static(`img`))
    app.use(express.static(`public`))

    app.use(bodyParser.json({ limit: `50mb` }))
    app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

    // Add intentional latency to all responses to simulate real life
    if (process.env.NODE_ENV !== `production`)
      app.use((req, res, next) => { setTimeout(next, 640) })

    app.use(`/api`, router({ app, db, io }))

    server.listen(port, () => {
      console.log(chalk.white(`☆ listening on localhost:${port}`))
      console.log(chalk.green("✅ Server started at " + new Date(Date.now())))
    })
  }

  catch (err) {
    console.log(err)
  }
}

bootstrap()
