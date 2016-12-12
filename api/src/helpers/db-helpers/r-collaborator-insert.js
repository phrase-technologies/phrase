import r from 'rethinkdb'

export default async (db, { phraseId, userId }) => {
  let dateCreated = new Date()

  let collaborator = await r.table(`collaborators`).insert({
    userId,
    phraseId,
    dateCreated,
  }).run(db)

  return collaborator
}
