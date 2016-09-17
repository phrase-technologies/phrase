import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
  api.post(`/loadOne`, async (req, res) => {
    let { phraseId, userId } = req.body

    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      if (loadedPhrase.privacySetting === `private`) {
        if (userId !== loadedPhrase.userId && !loadedPhrase.collaborators.includes(userId)) {
          return res.json({ success: false, message: `Phrase not found!` })
        }
      }

      let phraseAuthor = await r.table(`users`).get(loadedPhrase.userId).run(db)
      loadedPhrase.username = phraseAuthor.username
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
