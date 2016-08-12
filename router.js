import express from 'express'
import chalk from 'chalk'
import r from 'rethinkdb'
import auth from './auth'
import { sendRephraseEmail } from './helpers/emailHelper'

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

  api.post(`/rephrase-email`, async (req, res) => {
    let { username, phraseId } = req.body
    try {
      let parentPhraseId = await r.table(`phrases`).get(phraseId).getField(`parentId`).run(db)
      let authorUserId = await r.table(`phrases`).get(parentPhraseId).getField(`userId`).run(db)
      let user = await r.table(`users`).get(authorUserId).run(db)
      if (user.username !== username)
        sendRephraseEmail({
          email: user.email,
          authorUsername: user.username,
          username,
          phraseId,
        })
      res.json({ success: true })
    } catch (error) {
      console.log(`/rephrase-email`, chalk.magenta(error))
      res.json({ error })
    }
  })

  auth({ app, api, db })

  /*
   *  Everything below here requires a valid token.
   */

  api.post(`/save`, async (req, res) => {
    let { parentId = null, phraseState, phraseName, userId } = req.body
    try {
      let result = await r.table(`phrases`).insert({
        parentId,
        state: phraseState,
        public: true,
        dateCreated: +new Date(),
        dateModified: +new Date(),
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
          dateModified: +new Date(),
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
