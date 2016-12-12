import r from 'rethinkdb'
import runMigration from '../runMigration.js'

let migration = async ({ db }) => {
  await r.table(`users`).indexCreate(`resetToken`).run(db)
}

runMigration({ migration })
