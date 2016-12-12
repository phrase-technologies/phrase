import r from 'rethinkdb'
import runMigration from '../runMigration'

let migration = async ({ db }) => {
  // Create dedicated collaborators map table
  await r.tableCreate(`collaborators`).run(db)
  await r.table(`collaborators`).indexCreate(`phraseId`).run(db)
  await r.table(`collaborators`).indexCreate(`userId`).run(db)
  await r.table(`collaborators`).indexCreate(
    "phraseIdAndUserId", [r.row(`phraseId`), r.row(`userId`)]
  ).run(db)

  // Populate collaborators based on existing Phrases
  let phraseCursor = await r.table(`phrases`).run(db)
  let phrases = await phraseCursor.toArray()
  phrases.forEach(phrase => {
    phrase.collaborators.forEach(async (userId) => {
      await r.table(`collaborators`).insert({
        phraseId: phrase.id,
        userId,
      }).run(db)
    })
  })

  // Remove obsolete collaborators field from phrases
  await r.table(`phrases`).replace(r.row.without(`collaborators`)).run(db)
}

runMigration({ migration })
