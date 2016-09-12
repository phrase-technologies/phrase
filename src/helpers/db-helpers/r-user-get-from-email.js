import r from 'rethinkdb'

export default async (db, { email }) => {
  if (!email) return null
  let cursor = await r.table(`users`)
    .getAll(email.toLowerCase(), { index: `email` })
    .limit(1)
    .run(db)
  let users = await cursor.toArray()
  return users[0]
}
