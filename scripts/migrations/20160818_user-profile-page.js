
r = require(`rethinkdb`)

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, (err, conn) => {
  r.table(`phrases`).indexCreate(`userId`).run(conn)
  process.exit()
})
