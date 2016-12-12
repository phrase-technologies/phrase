import chalk from 'chalk'

import { rUserGet } from '../../helpers/db-helpers'
import { formatLoadedUser } from '../../helpers/user'

export default ({ api, db }) => {
  api.post(`/loadUser`, async (req, res) => {
    let { theUserId: userId } = req.body
    if (!userId)
      return res.json({ success: false, message: `Must supply a userId` })

    try {
      let loadedUser = await rUserGet(db, { id: userId })

      if (!loadedUser)
        return res.status(404).json({ success: false, message: `User not found!` })

      res.json({ loadedUser: formatLoadedUser({ loadedUser }) })

      console.log(chalk.cyan(
        `User ${userId} loaded!`
      ))

    } catch (error) {
      console.log(`/loadUser:`, chalk.magenta(error))
      res.json({ error })
    }
  })
}
