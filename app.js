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

async function bootstrap () {
  try {

    /*
     *  Connect to rethink!
     */

    let db = await r.connect({ host: `localhost`, db: `phrase`, port: 28015 })

    /*
     *  Setup database!
     */

    try {
      await r.dbCreate(`phrase`).run(db)
      await r.tableCreate(`users`).run(db)
      await r.tableCreate(`connections`).run(db)
      await r.table(`users`).indexCreate(`username`).run(db)
      await r.table(`users`).indexCreate(`email`).run(db)
      await r.tableCreate(`phrases`).run(db)
      await r.table(`phrases`).indexCreate(`phrasename`).run(db)

      console.log(chalk.cyan(
        `Database setup complete!`
      ))
    }
    catch (err) { console.log(err) }

    let app = express()
    let http = Server(app)
    let io = socketIO(http)

    io.on(`connection`, async socket => {

      try { await r.table(`connections`).insert({ id: socket.id }).run(db) }
      catch (e) { console.log(chalk.white(e)) }

      let count = await r.table(`connections`).count().run(db)

      console.log(chalk.yellow(
        `⚡ New connection! Number of open connections: ${count}`
      ))

      socket.on(`disconnect`, async () => {
        try { await r.table(`connections`).get(socket.id).delete().run(db) }
        catch (e) { console.log(chalk.white(e)) }

        let count = await r.table(`connections`).count().run(db)

        console.log(chalk.magenta(
          `⚡ Disconnection! Number of open connections: ${count}`
        ))
      })
    })

    let port = process.env.PORT || 5000

    app.set(`superSecret`, secret)

    app.use(cors())

    app.use(bodyParser.json({ limit: `50mb` }))
    app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

    // Add intentional latency to all responses to simulate real life
    if (!process.env.PRODUCTION)  // TODO use a real flag here
      app.use((req, res, next) => { setTimeout(next, 640) })

    app.use(`/api`, router({ app, db, io }))

    http.listen(port, () => {
      console.log(chalk.white(`☆ listening on localhost:${port}`))
    })
  }

  catch (err) {
    console.log(err)
  }
}

bootstrap()
