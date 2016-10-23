import r from 'rethinkdb'

export default async (db) => {
  let token = await generateUniqueToken({
    table: `inviteCodes`,
    index: `code`,
    db,
  })
  let result = await r.table(`inviteCodes`).insert({
    code: token,
    used: false,
  }).run(db)
  return result
}
