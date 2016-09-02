console.log(`Run this with: npm run migrate -- scripts/migrations/20160815_invite-code.js`)
let r = require(`rethinkdb`)

let crypto = require(`crypto`)

let generateUniqueToken = async ({ db }) => {
  let nBytes = 3
  let token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()
  while(true) {
    let cursor = await r.table(`inviteCodes`)
      .getAll(token, { index: `code` })
      .limit(1)
      .run(db)
    let inviteCodes = await cursor.toArray()
    if (inviteCodes[0]) token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()
    else break
  }
  return token
}

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, async (err, conn) => {
  for(let i = 0; i < 1000; i++) {
    let token = await generateUniqueToken({ db: conn })
    await r.table(`inviteCodes`).insert({
      code: token,
      used: false,
    }).run(conn)
  }
  process.exit()
})
