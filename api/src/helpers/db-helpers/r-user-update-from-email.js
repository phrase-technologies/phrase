import r from 'rethinkdb'

export default async (db, { email, update }) => {
  if (!email || !update) return null
  let result = await r.table(`users`)
    .getAll(email.toLowerCase(), { index: `email` })
    .limit(1)
    .update(update)
    .run(db)
  return result
}
