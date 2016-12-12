import r from 'rethinkdb'
import chalk from 'chalk'
import { rCollaboratorGet } from '../../helpers/db-helpers'

export default ({ api, db }) => {
  api.post(`/loadOne`, async (req, res) => {
    let { phraseId, userId } = req.body

    if (!phraseId)
      return res.json({ success: false, message: `Missing phraseId.`})

    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      if (!loadedPhrase) {
        return res.json({ success: false, message: `Phrase not found!` })
      }

      let collaboratorUserIds = await rCollaboratorGet(db, { phraseId })
      if (loadedPhrase.privacySetting === `private`) {
        if (userId !== loadedPhrase.userId && !collaboratorUserIds.includes(userId)) {
          return res.json({ success: false, message: `Phrase not found!` })
        }
      }

      let phraseAuthor = await r.table(`users`).get(loadedPhrase.userId).run(db)
      loadedPhrase.username = phraseAuthor.username
      loadedPhrase.collaborators = collaboratorUserIds

      res.json({ loadedPhrase })

      console.log(chalk.cyan(
        `Phrase ${phraseId} loaded!`
      ))

    } catch (error) {
      console.log(`/loadOne:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
