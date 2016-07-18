
r = require('rethinkdb')

r.connect({ host: `localhost`, db: `phrase`, port: 28015 }, function(err, conn) {
  r.table(`users`).indexCreate(`resetToken`).run(conn)
})