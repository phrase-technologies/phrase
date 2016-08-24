import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
  api.post(`/loadUserPhrases`, async (req, res) => {
    try {
      let { username } = req.body
      let userCursor = await r
        .table(`users`)
        .getAll(username, { index: `username` })
        .limit(1)
        .run(db)
      let user = await userCursor.toArray()[0]
      if (!user) {
        return res.status(404).json({ message: `User not found.` })
      }

      let phraseCursor = await r
        .table(`phrases`)
        .getAll(user.userId, { index: `userId` })
        .eqJoin(`userId`, r.table(`users`))
        .without({ right: [`id`, `password`, `email`] })
        .zip()
        .run(db)
      let phrases = await phraseCursor.toArray()
      res.json({ phrases })
    } catch (error) {
      console.log(`/loadUserPhrases:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
