import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
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
      console.log(`/loadOne:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
