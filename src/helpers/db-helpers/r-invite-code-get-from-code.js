import r from 'rethinkdb'

export default async (db, { inviteCode }) => {
  if (!inviteCode) return null
  let inviteCodeResults = await r
    .table(`inviteCodes`)
    .getAll(inviteCode.trim(), { index: `code` })
    .limit(1)
    .run(db)
  let inviteCodeResult = await inviteCodeResults.toArray()
  return inviteCodeResult[0]
}
