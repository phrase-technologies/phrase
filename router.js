import express from 'express'
import chalk from 'chalk'
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

      console.log(chalk.cyan(
        `Phrase ${phraseId} loaded!`
      ))
      
    } catch (error) {
      res.json({ error })
    }
  })

  api.post(`/save`, async (req, res) => {
    let { phraseState, email = `guest`, username } = req.body
    try {
      let phrasename = `phrase-${+new Date()}`

      let result = await r.table(`phrases`).insert({
        state: phraseState,
        public: true,
        saved_date: +new Date(),
        phrasename,
        username,
        email,
      }).run(db)

      console.log(chalk.cyan(
        `Phrase ${result.generated_keys} added!`
      ))

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

  api.post(`/update`, async (req, res) => {
    let { phraseState, phraseId } = req.body

    try {
      let result = await r.table(`phrases`).get(phraseId).update({
        state: phraseState,
        saved_date: +new Date(),
      }).run(db)

      console.log(chalk.cyan(
        `Phrase ${phraseId} ${!result.skipped ? `updated!` : `not found!`}`
      ))

      res.json({ message: `autosave success` })
    }
    catch (error) {
      res.json({ error })
    }
  })

  return api
}
