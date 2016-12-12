import r from 'rethinkdb'

export default async (db, { phraseId }) => {
  if (!phraseId) return null

  let collaboratorCursor = await r
    .table(`collaborators`)
    .getAll(phraseId, { index: "phraseId" })
    .run(db)
  let collaboratorUserIds = await collaboratorCursor
    .toArray()
    .map(collaborator => collaborator.userId)

  return collaboratorUserIds
}
