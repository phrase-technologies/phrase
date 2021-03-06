import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
  api.post(`/loadUserPhrases`, async (req, res) => {
    try {
      let { username } = req.body
      let usernameLC = username.trim().toLowerCase()

      let userCursor = await r
        .table(`users`)
        .getAll(usernameLC, { index: `usernameLC` })
        .limit(1)
        .run(db)

      let users = await userCursor.toArray()
      let user = users[0]

      if (!user) {
        return res.status(404).json({ message: `User not found.` })
      }

      let phraseCursor = await r
        .table(`phrases`)
        .getAll(user.id, { index: `userId` })
        .eqJoin(`userId`, r.table(`users`))
        .without({ right: [`id`, `password`, `email`] })
        .zip()
        .run(db)

      let phrases = await phraseCursor.toArray()
      res.json({ phrases, picture: user.picture })
    } catch (error) {
      console.log(`/loadUserPhrases:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
