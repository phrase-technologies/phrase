import r from 'rethinkdb'

export default async (db, { email, userId }) => {

  // Replace all email collaborator invites with registered user id
  await r.table(`collaborators`)
    .getAll(email, { index: "userId" })
    .update({ userId })

  return
}
