import r from 'rethinkdb'
import fs from 'fs'
import path from 'path'
import runMigration from '../runMigration'

let migration = async ({ db }) => {
  await r.tableCreate(`migrations`).run(db)
  await r.table(`migrations`).indexCreate(`script`).run(db)

  let thisScript = path.basename(process.argv[1])
  let migrationScripts = fs.readdirSync(`scripts/migrations`).reduce((arr, script) => ([
    ...arr,
    ...(script !== thisScript ? [{ script }] : []),
  ]), [])
  await r.table(`migrations`).insert(migrationScripts).run(db)
}

runMigration({ migration })
