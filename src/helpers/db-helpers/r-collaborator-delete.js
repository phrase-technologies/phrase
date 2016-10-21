import r from 'rethinkdb'

export default async (db, { phraseId, userId }) => {
  if (!phraseId || !userId) return

  let collaboratorCursor = await r
    .table(`collaborators`)
    .getAll([phraseId, userId], { index: "phraseIdAndUserId" })
    .delete()
    .run(db)

  return
}
