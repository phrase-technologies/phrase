import r from 'rethinkdb'
import runMigration from '../runMigration'
import { generateUniqueToken } from '../../src/helpers/token'

let migration = async ({ db }) => {
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
