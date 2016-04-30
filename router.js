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
      await r.tableCreate(`phrases`).run(db)
      console.log(`phrases table created`)
      res.json({ phrases: [] })
    }
  })

  api.post(`/save`, async (req, res) => {
    let { phraseState, email = `guest` } = req.body
    try {
      let name = `phrase-${+new Date()}`

      await r.table(`phrases`).insert({
        state: phraseState,
        public: true,
        saved_date: +new Date(),
        name,
        email,
      }).run(db)

      res.json({ message: `Project Saved!`, projectName: name })

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
