/* global process, require */

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import r from 'rethinkdb'
import chalk from 'chalk'
import { secret } from './config'
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
      await r.table(`users`).indexCreate(`username`, `email`).run(db)
      await r.tableCreate(`phrases`).run(db)
      await r.table(`phrases`).indexCreate(`phrasename`).run(db)
    }
    catch (err) { console.log(err) }

    let app = express()
    let http = Server(app)

    let port = process.env.PORT || 5000

    app.set(`superSecret`, secret)

    app.use(cors())

    app.use(bodyParser.json({ limit: `50mb` }))
    app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

    app.use(`/api`, router({ app, db }))

    http.listen(port, () => {
      console.log(chalk.white(`☆ listening on localhost:${port}`))
    })
  }

  catch (err) {
    console.log(err)
  }
}

bootstrap()
