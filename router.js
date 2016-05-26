import express from 'express'
import chalk from 'chalk'
import r from 'rethinkdb'
import auth from './auth'

export default ({ app, db }) => {

  let api = express.Router()

  api.post(`/load`, async (req, res) => {
    try {
      let cursor = await r
        .table(`phrases`)
        .eqJoin(`userId`, r.table(`users`))
        .without({right: [`id`, `password`, `email`]})
        .zip()
        .run(db)
      let phrases = await cursor.toArray()
      res.json({ phrases })
    } catch (error) {
      console.log(`/load:`, chalk.magenta(err))
      res.json({ error })
    }
  })

  api.post(`/loadOne`, async (req, res) => {
    let { phraseId } = req.body
    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)
      let phraseAuthor = await r.table(`users`).get(loadedPhrase.userId).run(db)
      loadedPhrase.username = phraseAuthor.username
      res.json({ loadedPhrase })

      console.log(chalk.cyan(
        `Phrase ${phraseId} loaded!`
      ))

    } catch (error) {
      console.log(`/loadOne:`, chalk.magenta(err))
      res.json({ error })
    }
  })

  api.post(`/save`, async (req, res) => {
    let { phraseState, phraseName, userId } = req.body
    try {
      let result = await r.table(`phrases`).insert({
        state: phraseState,
        public: true,
        saved_date: +new Date(),
        phrasename: phraseName,
        userId,
      }).run(db)

      console.log(chalk.cyan(
        `Phrase ${result.generated_keys[0]} added!`
      ))

      res.json({ message: `Project Saved!`, phraseId: result.generated_keys[0] })

    } catch (err) {
      console.log(`/save:`, chalk.magenta(err))
      res.json({ error: true, message: `something went wrong!` })
    }
  })

  auth({ app, api, db })

  /*
   *  Everything below here requires a valid token.
   */

  api.post(`/update`, async (req, res) => {
    let { phraseId, phraseName, phraseState, userId } = req.body

    if (userId === req.decoded.id) {
      try {
        let phrase = await r.table(`phrases`).get(phraseId)

        // Edit Permissions?
        let authorId = await phrase.getField(`userId`).run(db)
        if (authorId !== userId)
          throw Error(`You do not have permission to edit this Phrase.`)

        let result = await phrase.update({
          phrasename: phraseName,
          state: phraseState,
          saved_date: +new Date(),
        }).run(db)

        console.log(chalk.cyan(
          `Phrase ${phraseId} ${!result.skipped ? `Updated!` : `Not found!`}`
        ))

        res.json({ message: `Autosave success.` })
      }
      catch (error) {
        console.log(`/update:`, chalk.magenta(error))
        res.json({ error })
      }
    }

    else {
      res.json({ message: `Please login in order to make changes.` })
    }
  })

  return api
}
