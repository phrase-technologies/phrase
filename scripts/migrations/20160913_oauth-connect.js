console.log(`Run this with: npm run migrate -- scripts/migrations/20160815_invite-code.js`)
let r = require(`rethinkdb`)

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, async (err, conn) => {
  await r.tableCreate(`oAuth`).run(conn)
  await r.table(`oAuth`).indexCreate(`oAuthToken`).run(conn)
  await r.table(`oAuth`).indexCreate(`email`).run(conn)
  console.log(`table and index created`)
  process.exit()
})
