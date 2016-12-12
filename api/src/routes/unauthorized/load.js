import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
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
      console.log(`/load:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
