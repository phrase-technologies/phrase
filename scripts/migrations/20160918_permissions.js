let r = require(`rethinkdb`)

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, (err, conn) => {
  r.table(`phrases`).replace(r.row.without(`public`)).run(conn, (err) => {
    if (err) throw err

    r.table(`phrases`).update(row => ({
      masterControl: [row(`userId`)],
      privacySetting: `private`,
      collaborators: [],
    })).run(conn, err => {
      if (err) throw err

      process.exit()
    })
  })
})
