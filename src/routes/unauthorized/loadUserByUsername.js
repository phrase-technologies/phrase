import r from 'rethinkdb'
import chalk from 'chalk'

import { rUserGetFromUsername } from '../../helpers/db-helpers'
import { formatLoadedUser } from '../../helpers/user'

export default ({ api, db }) => {
  api.post(`/loadUserByUsername`, async (req, res) => {
    let { theUsername } = req.body // theUsername because username is populated by localStorage
    console.log(theUsername)
    if (!theUsername)
      return res.json({ success: false, message: `Must supply a username` })

    try {
      let loadedUser = await rUserGetFromUsername(db, { username: theUsername })

      if (!loadedUser)
        return res.json({ success: false, message: `User not found!` })

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
