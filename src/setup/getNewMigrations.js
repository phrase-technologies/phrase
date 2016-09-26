import r from 'rethinkdb'
import fs from 'fs'

export default async ({ db }) => {
  // Get all migrations logged in the DB, put them in a hash table (JSON obj)
  let cursor = await r.table(`migrations`).run(db)
  let dbMigrations = (await cursor.toArray()).reduce((obj, val) => {
    obj[val.script] = 1
    return obj
  }, {})
  // Iterate fs migration scripts, ensure the db contains each one
  let newMigrationScripts = fs
    .readdirSync(`scripts/migrations`)
    .reduce((arr, val) => ([
      ...arr,
      ...(!dbMigrations[val] ? [val] : []),
    ]), [])
  return newMigrationScripts
}
