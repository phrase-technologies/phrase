import r from 'rethinkdb'
import runMigration from '../runMigration'

let migration = async ({ db }) => {
  await r.tableCreate(`comments`).run(db)
  await r.table(`comments`).indexCreate(`phraseId`).run(db)
  await r.table(`comments`).indexCreate(`authorId`).run(db)
  await r.table(`comments`).indexCreate(`start`).run(db)
}

runMigration({ migration })
