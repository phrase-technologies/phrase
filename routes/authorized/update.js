import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
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
}
