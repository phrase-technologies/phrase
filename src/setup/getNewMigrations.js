import r from 'rethinkdb'
import migrations from '../../scripts/migrations'

export default async ({ db }) => {
  let migrationScripts = Object.keys(migrations)
  // Get all migrations logged in the DB, put them in a hash table (JSON obj)
  let cursor = await r.table(`migrations`).run(db)
  let dbMigrations = (await cursor.toArray()).reduce((obj, val) => {
    obj[val.script] = 1
    return obj
  }, {})
  // Iterate fs migration scripts, ensure the db contains each one
  let newMigrationScripts = migrationScripts.reduce((arr, val) => {
    if (!dbMigrations[val]) arr.push(val)
    return arr
  }, [])
  return newMigrationScripts
}
