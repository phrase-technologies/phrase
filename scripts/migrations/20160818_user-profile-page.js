import r from 'rethinkdb'
import runMigration from '../runMigration'

let migration = async ({ db }) => {
  await r.table(`phrases`).indexCreate(`userId`).run(db)
}

runMigration({ migration })
