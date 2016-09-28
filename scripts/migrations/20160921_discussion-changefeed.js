let r = require(`rethinkdb`)

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, async (err, conn) => {
  await r.tableCreate(`comments`).run(conn)
  await r.table(`comments`).indexCreate(`phraseId`).run(conn)
  await r.table(`comments`).indexCreate(`authorId`).run(conn)
  await r.table(`comments`).indexCreate(`start`).run(conn)

  console.log("Comments table created and indexed!")
  process.exit()
})
