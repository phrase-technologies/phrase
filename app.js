/* global process, require */

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import r from 'rethinkdb'
import chalk from 'chalk'
import { secret } from './config'
import { Server } from 'http'

import router from './router'

r.connect({ host: `localhost`, db: `phrase`, port: 28015 })
  .then(db => {

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
  })
