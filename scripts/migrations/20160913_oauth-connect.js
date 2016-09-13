console.log(`Run this with: npm run migrate -- scripts/migrations/20160815_invite-code.js`)
let r = require(`rethinkdb`)

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, async (err, conn) => {
  r.table(`users`).indexCreate(`oAuthToken`).run(conn)
  console.log(`index created`)
  process.exit()
})
