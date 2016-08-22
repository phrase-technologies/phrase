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
import setupDatabase from './setupDatabase'
import setupSocketConnection from './setupSocketConnection'

async function bootstrap () {
  try {
    let db = await r.connect({ host: `localhost`, db: `phrase`, port: 28015 })

    try { await setupDatabase({ name: `phrase`, db }) }
    catch (err) { console.log(err) }

    let app = express()
    let server = Server(app)
    let io = socketIO(server)

    setupSocketConnection({ io, db })

    let port = process.env.PORT || 5000

    app.set(`superSecret`, secret)

    app.use(cors())
    app.use(express.static(`sounds`))
    app.use(express.static(`img`))

    app.use(bodyParser.json({ limit: `50mb` }))
    app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

    // Add intentional latency to all responses to simulate real life
    if (process.env.NODE_ENV !== `production`)
      app.use((req, res, next) => { setTimeout(next, 640) })

    app.use(`/api`, router({ app, db, io }))

    server.listen(port, () => {
      console.log(chalk.white(`☆ listening on localhost:${port}`))
    })
  }

  catch (err) {
    console.log(err)
  }
}

bootstrap()
