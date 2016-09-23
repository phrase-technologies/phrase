import r from 'rethinkdb'
import migrations from '../../scripts/migrations'

export default async ({ db }) => {
  await r.tableCreate(`migrations`).run(db)
  await r.table(`migrations`).indexCreate(`script`).run(db)

  let migrationScripts = Object.keys(migrations).reduce((arr, script) => {
    arr.push({ script })
    return arr
  }, [])
  await r.table(`migrations`).insert(migrationScripts).run(db)
}
