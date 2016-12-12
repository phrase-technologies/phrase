import r from 'rethinkdb'

export default async (db, user) => {
  if (!user.dateCreated) user.dateCreated = new Date()
  let createdUser = await r.table(`users`).insert(user).run(db)
  return createdUser
}
