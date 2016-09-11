// Vendor
import r from 'rethinkdb'
import express from 'express'
import socketIO from 'socket.io'
import chalk from 'chalk'
import { Server } from 'http'
import bodyParser from 'body-parser'

// Custom
import router from './router'
import { setupDatabase, setupSocketConnection } from './setup'

/*----------------------------------------------------------------------------*/

let app, db, io, server

before(async function() {
  console.log(chalk.white(`☆ Running tests..`))
  this.timeout(100000)
  db = await r.connect({ host: `localhost`, db: `test`, port: 28015 })
  await r.dbDrop(`test`).run(db)
  await setupDatabase({ db, name: `test` })

  app = express()
  server = Server(app)
  io = socketIO(server)

  setupSocketConnection({ io, db })

  app.use(bodyParser.json({ limit: `50mb` }))
  app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

  app.use(`/api`, router({ app, db, io }))

  server.listen(9999)
})

after(() => {
  server.close()
})

/*----------------------------------------------------------------------------*/

export let domain = `http://localhost:9999`
