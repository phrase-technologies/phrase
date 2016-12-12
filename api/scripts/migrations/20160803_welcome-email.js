import r from 'rethinkdb'
import runMigration from '../runMigration'

let migration = async ({ db }) => {
  await r.table(`users`).indexCreate(`confirmToken`).run(db)
}

runMigration({ migration })
