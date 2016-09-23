import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db }) => {
  api.post(`/loadUser`, async (req, res) => {
    let { userId } = req.body

    try {
      let loadedUser = await r.table(`users`).get(userId).run(db)

      if (!loadedUser) {
        return res.json({ success: false, message: `User not found!` })
      }

      res.json({ loadedUser })

      console.log(chalk.cyan(
        `User ${userId} loaded!`
      ))

    } catch (error) {
      console.log(`/loadUser:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
