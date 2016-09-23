import r from 'rethinkdb'
import migrations from './migrations'
import getNewMigrations from '../src/setup/getNewMigrations'
import createMigrations from '../src/setup/createMigrations'

let migrate = async () => {
  let db = await r.connect({ host: `localhost`, db: `phrase`, port: 28015 })
  let tables = await r.tableList().run(db)
  if (!tables.includes('migrations')) {
    await createMigrations({ db }) // Assume all previous migrations have been run.
  }
  else {
    let newMigrations = await getNewMigrations({ db })
    if (!newMigrations.length)
      console.log(`No pending migrations`)
    else {
      for(let i = 0; i < newMigrations.length; i++) {
        let script = newMigrations[i]
        console.log(`Running migration ${script}`)
        try {
          await migrations[script]({ db })
          await r.table('migrations').insert({ script }).run(db)
        }
        catch (e) {
          console.log(`Migration failed: ${e}`)
        }
      }
    }
  }
  console.log(`Done! Feel free to kill the script.`)
}

migrate()
