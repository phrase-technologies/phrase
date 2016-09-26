import r from 'rethinkdb'
import runMigration from '../runMigration'

let migration = async ({ db }) => {
  await r.tableCreate(`oAuth`).run(db)
  await r.table(`oAuth`).indexCreate(`oAuthToken`).run(db)
  await r.table(`oAuth`).indexCreate(`email`).run(db)
}

runMigration({ migration })
