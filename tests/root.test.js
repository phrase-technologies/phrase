// Vendor
import r from 'rethinkdb'
import express from 'express'
import socketIO from 'socket.io'
import chalk from 'chalk'
import { Server } from 'http'
import bodyParser from 'body-parser'

// Source
import router from '../src/router'
import { setupDatabase, setupSocketConnection } from '../src/setup'
import { secret } from '../src/config'

/*----------------------------------------------------------------------------*/

// Auth Tests
import signup from './auth/routes/signup'
import login from './auth/routes/login'

// Unauthorized Tests
import loadUserPhrases from './routes/unauthorized/loadUserPhrases'

// Authorized Tests
import save from './routes/authorized/save'

/*----------------------------------------------------------------------------*/

let app, db, io, server
let domain = `http://localhost:9999`

let testUser = {
  email: `foo@foo`,
  username: `foo`,
  password: `best_password_bro`,
}

/*----------------------------------------------------------------------------*/

async function runTests () {

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

    app.set(`superSecret`, secret)

    app.use(bodyParser.json({ limit: `50mb` }))
    app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

    app.use(`/api`, router({ app, db, io }))

    server.listen(9999)
  })

/*----------------------------------------------------------------------------*/

  // Test order matters!

  signup({ domain, testUser })
  let { token, user } = await login({ domain, testUser })
  loadUserPhrases({ domain, user })
  save({ domain, user, token })

/*----------------------------------------------------------------------------*/

  after(() => {
    server.close()
  })
}

/*----------------------------------------------------------------------------*/

runTests()
