import r from 'rethinkdb'

export default async (db, { phraseId }) => {
  if (!phraseId) return null
  let phrase = await r.table(`phrases`)
    .get(phraseId)
    .run(db)
  return phrase
}
