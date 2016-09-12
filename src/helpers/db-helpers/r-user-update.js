import r from 'rethinkdb'

export default async (db, { id, update }) => {
  if (!id || !update) return null
  let result = await r.table(`users`)
    .get(id)
    .update(update)
    .run(db)
  return result
}
