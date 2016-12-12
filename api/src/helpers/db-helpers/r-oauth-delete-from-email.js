import r from 'rethinkdb'

export default async (db, { email }) => {
  if (!email)
    return null
  let result = await r.table(`oAuth`)
    .getAll(email.toLowerCase(), { index: `email` })
    .delete()
    .run(db)
  return result
}
