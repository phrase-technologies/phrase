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

// Auth
import oAuthLogin from './auth/routes/oauth-login'
import signup from './auth/routes/signup'
import login from './auth/routes/login'

// Unauthorized
import loadUserPhrases from './routes/unauthorized/loadUserPhrases'

// Authorized
import save from './routes/authorized/save'
import deletePhrase from './routes/authorized/deletePhrase'

/*----------------------------------------------------------------------------*/

let globals = { domain: `http://localhost:9999` }

let alice = {
  email: `alice@foo`,
  username: `alice`,
  password: `alice_password`,
}

let bob = {
  email: `bob@foo`,
  username: `bob`,
  password: `bob_password`,
}

/*----------------------------------------------------------------------------*/

async function runTests () {

  before(async function() {
    let app, db, io, server
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

    globals.db = db
    globals.app = app
    globals.io = io
    globals.server = server
  })

/*---Test order matters!------------------------------------------------------*/
  // oAuth
  oAuthLogin({ globals })

  // Auth
  await signup({ globals, user: alice })
  await signup({ globals, user: bob })

  let aliceLogin = await login({ globals, user: alice })
  alice.token = aliceLogin.token
  alice.user = aliceLogin.user

  let bobLogin = await login({ globals, user: bob })
  bob.token = bobLogin.token
  bob.user = bobLogin.user

  // Unauthorized
  loadUserPhrases({ globals, user: alice })

  // Authorized
  let { phraseId } = await save({ globals, user: alice, token: alice.token })
  deletePhrase({ globals, author: alice, observer: bob, phraseId })

/*----------------------------------------------------------------------------*/

  after(() => {
    globals.server.close()
  })
}

/*----------------------------------------------------------------------------*/

runTests()
