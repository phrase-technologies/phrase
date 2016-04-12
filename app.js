/* global process, require */

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import chalk from 'chalk'
import { database, secret } from './config'
import { Server } from 'http'

import router from './router'

mongoose.connect(database)

let app = express()
let http = Server(app)

let port = process.env.PORT || 5000

app.set(`superSecret`, secret)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(`/api`, router({ app }))

http.listen(port, () => {
  console.log(chalk.white(`☆ listening on localhost:${port}`))
})
