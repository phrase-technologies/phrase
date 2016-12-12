import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db, io }) => {
  api.post(`/update`, async (req, res) => {
    let { phraseId, phraseName, phraseState, userId } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let masterControl = await phrase.getField(`masterControl`).run(db)

      if (!masterControl.includes(userId)) {
        throw Error(`You do not have permission to edit this Phrase.`)
      }

      let result = await phrase.update({
        phrasename: phraseName,
        state: phraseState,
        dateModified: +new Date(),
      }).run(db)

      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)
      let phraseAuthor = await r.table(`users`).get(loadedPhrase.userId).run(db)
      loadedPhrase.username = phraseAuthor.username

      io.to(loadedPhrase.id).emit(`server::updatePhrase`, loadedPhrase)

      console.log(chalk.cyan(
        `Phrase ${phraseId} ${!result.skipped ? `Updated!` : `Not found!`}`
      ))

      res.json({ message: `Autosave success.` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }
  })
}
