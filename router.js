import express from 'express'
import r from 'rethinkdb'
import auth from './auth'

export default ({ app, db }) => {

  let api = express.Router()

  api.post(`/load`, async (req, res) => {
    try {
      let cursor = await r.table(`phrases`).run(db)
      let phrases = await cursor.toArray()
      res.json({ phrases })
    } catch (error) {
      res.json({ error })
    }
  })

  api.post(`/loadOne`, async (req, res) => {
    let { phraseId } = req.body
    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)
      res.json({ loadedPhrase })
    } catch (error) {
      res.json({ error })
    }
  })

  api.post(`/save`, async (req, res) => {
    let { phraseState, email = `guest` } = req.body
    try {
      let phrasename = `phrase-${+new Date()}`

      let result = await r.table(`phrases`).insert({
        state: phraseState,
        public: true,
        saved_date: +new Date(),
        phrasename,
        email,
      }).run(db)

      res.json({ message: `Project Saved!`, phraseId: result.generated_keys })

    } catch (err) {
      console.log(err)
      res.json({ error: true, message: `something went wrong!` })
    }
  })

  auth({ app, api, db })

  /*
   *  Everything below here requires a valid token.
   */

  return api
}
