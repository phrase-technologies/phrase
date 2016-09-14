import r from 'rethinkdb'
import chalk from 'chalk'
import { sendRephraseEmail } from '../../helpers/emailHelper'

export default ({ api, db }) => {
  api.post(`/save`, async (req, res) => {
    let { parentId = null, phraseState, phraseName } = req.body
    let { id: userId } = req.decoded

    if (!phraseState) {
      res.json({ success: false, message: `State must exist to save.` })
      return
    }

    try {
      let timestamp = +new Date()

      let result = await r.table(`phrases`).insert({
        parentId,
        state: phraseState,
        public: true,
        dateCreated: timestamp,
        dateModified: timestamp,
        phrasename: phraseName, // TODO: fix this inconsistency
        userId,
      }).run(db)

      if (parentId) { // Send rephrase email
        let authorUserId = await r.table(`phrases`).get(parentId).getField(`userId`).run(db)
        let author = await r.table(`users`).get(authorUserId).run(db)
        if (author.id !== userId) {
          let user = await r.table(`users`).get(userId).run(db)
          sendRephraseEmail({
            email: author.email,
            authorUsername: author.username,
            username: user.username,
            phraseId: result.generated_keys[0],
          })
        }
      }

      console.log(chalk.cyan(
        `Phrase ${result.generated_keys[0]} added!`
      ))

      res.json({ message: `Project Saved!`, phraseId: result.generated_keys[0] })

    } catch (err) {
      console.log(`/save:`, chalk.magenta(err))
      res.json({ error: true, message: `something went wrong!` })
    }
  })
}
