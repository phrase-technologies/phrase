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
import signup from './auth/routes/signup'
import login from './auth/routes/login'

// Unauthorized
import loadUserPhrases from './routes/unauthorized/loadUserPhrases'
import loadOne from './routes/unauthorized/loadOne'

// Authorized
import save from './routes/authorized/save'
import update from './routes/authorized/update'
import deletePhrase from './routes/authorized/deletePhrase'
import setPrivacySetting from './routes/authorized/setPrivacySetting'
import masterControl from './routes/authorized/masterControl'
import searchUsers from './routes/authorized/searchUsers'
import collab from './routes/authorized/collab'

/*----------------------------------------------------------------------------*/

let app, db, io, server
let domain = `http://localhost:9999`

let alice = {
  email: `alice@phrase`,
  username: `alice`,
  password: `alice_password`,
}

let bob = {
  email: `bob@phrase`,
  username: `bob`,
  password: `bob_password`,
}

let chris = {
  email: `chris@phrase`,
  username: `chris`,
  password: `chris_password`,
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

/*---Test order matters!------------------------------------------------------*/

  await signup({ domain, user: alice })
  await signup({ domain, user: bob })
  await signup({ domain, user: chris })

  let aliceLogin = await login({ domain, user: alice })

  alice = {
    ...alice,
    ...aliceLogin.user,
    token: aliceLogin.token,
  }

  let bobLogin = await login({ domain, user: bob })

  bob = {
    ...bob,
    ...bobLogin.user,
    token: bobLogin.token,
  }

  let chrisLogin = await login({ domain, user: chris })

  chris = {
    ...chris,
    ...chrisLogin.user,
    token: chrisLogin.token,
  }

  searchUsers({ domain, user: alice, userToSearch: bob })

  loadUserPhrases({ domain, user: alice })

  let { phraseId: publicPhraseId } = await save({ domain, user: alice, token: alice.token })
  let { phraseId: unlistedPhraseId } = await save({ domain, user: alice, token: alice.token })
  let { phraseId: privatePhraseId } = await save({ domain, user: alice, token: alice.token })

  setPrivacySetting({
    domain,
    phraseId: unlistedPhraseId,
    author: alice,
    observer: bob,
    privacySetting: `unlisted`,
  })

  setPrivacySetting({
    domain,
    phraseId: publicPhraseId,
    author: alice,
    observer: bob,
    privacySetting: `public`,
  })

  loadOne({ domain, author: alice, observer: bob, publicPhraseId, privatePhraseId })

  collab({ domain, author: alice, collaborator: chris, phraseId: privatePhraseId })

  update({ domain, author: alice, observer: bob, phraseId: publicPhraseId })

  masterControl({ domain, author: alice, observer: bob, phraseId: publicPhraseId })

  deletePhrase({ domain, author: alice, observer: bob, phraseId: publicPhraseId })

/*----------------------------------------------------------------------------*/

  after(() => {
    server.close()
  })
}

/*----------------------------------------------------------------------------*/

runTests()
