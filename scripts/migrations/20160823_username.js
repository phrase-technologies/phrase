r = require(`rethinkdb`)

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, (err, conn) => {
  r.table(`users`).indexCreate(`username`).run(conn)
  process.exit()
})
