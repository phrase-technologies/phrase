import r from 'rethinkdb'

export default async (db, { id }) => {
  if (!id) return null
  let user = await r.table(`users`)
    .get(id)
    .run(db)
  return user
}
