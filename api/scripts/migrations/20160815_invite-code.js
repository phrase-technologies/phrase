import r from 'rethinkdb'
import runMigration from '../runMigration'
import { generateUniqueToken } from '../../src/helpers/token'

let migration = async ({ db }) => {
  await r.tableCreate(`inviteCodes`).run(db)
  await r.table(`inviteCodes`).indexCreate(`userId`).run(db)
  await r.table(`inviteCodes`).indexCreate(`code`).run(db)
  await r.table(`inviteCodes`).indexWait(`code`).run(db)
  for(let i = 0; i < 1000; i++) {
    let token = await generateUniqueToken({
      table: `inviteCodes`,
      index: `code`,
      db,
    })
    await r.table(`inviteCodes`).insert({
      code: token,
      used: false,
    }).run(db)
  }
}

runMigration({ migration })
