import r from 'rethinkdb'

export default async (db, oAuth) => {
  if (!oAuth)
    return null
  if (!oAuth.dateCreated)
    oAuth.dateCreated = new Date()
  let result = await r.table(`oAuth`).insert(oAuth).run(db)
  return result
}
