import r from 'rethinkdb'

export default async (db, { username }) => {
  if (!username) return null
  let cursor = await r.table(`users`)
    .getAll(username.toLowerCase(), { index: `usernameLC` })
    .limit(1)
    .run(db)
  let users = await cursor.toArray()
  return users[0]
}
