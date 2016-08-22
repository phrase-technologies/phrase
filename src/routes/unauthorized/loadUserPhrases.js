import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
  api.post(`/loadUserPhrases`, async (req, res) => {
    try {
      let { userId } = req.body
      let cursor = await r
        .table(`phrases`)
        .getAll(userId, { index: `userId` })
        .eqJoin(`userId`, r.table(`users`))
        .without({ right: [`id`, `password`, `email`] })
        .zip()
        .run(db)

      let phrases = await cursor.toArray()
      res.json({ phrases })
    } catch (error) {
      console.log(`/loadUserPhrases:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
