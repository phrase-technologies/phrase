import { rUserGet } from '../helpers/db-helpers'

// Make sure it's a valid user, and kick them out if not
export default ({ api, db }) => {

  api.use(async (req, res, next) => {
    let { userId } = req.body

    if (userId) {
      let foundUser = await rUserGet(db, { id: userId })
      if (!foundUser) {
        return res.status(401).json({ message: `Invalid user.` })
      }
    }

    next()
  })

}
