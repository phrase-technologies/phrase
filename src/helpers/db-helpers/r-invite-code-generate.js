import r from 'rethinkdb'

import { generateUniqueToken } from '../token'

export default async (db) => {
  let token = await generateUniqueToken({
    table: `inviteCodes`,
    index: `code`,
    db,
  })
  await r.table(`inviteCodes`).insert({
    code: token,
    used: false,
  }).run(db)
  return token
}
