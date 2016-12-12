import r from 'rethinkdb'

export default async (db, { inviteCode }) => {
  if (!inviteCode) return null

  let result = await r
    .table(`inviteCodes`)
    .getAll(inviteCode.trim(), { index: `code` })
    .limit(1)
    .update({used: true})
    .run(db)

  return result
}
