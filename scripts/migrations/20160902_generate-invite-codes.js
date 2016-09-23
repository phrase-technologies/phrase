import r from 'rethinkdb'
import { generateUniqueToken } from '../../src/helpers/token'

export default async ({ db }) => {
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
