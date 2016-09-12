
import { rUserGetFromEmail } from '../../helpers/db-helpers'
import { generateAPIToken } from '../../helpers/token'

export default ({ app, db }) => {
  app.post(`/oauth-login`, async (req, res) => {
    let { token, email } = req.body

    try {
      let user = await rUserGetFromEmail(db, { email })
      if (!user) {
        res.json({ success: false, message: `Invalid user email` })
        return
      }

      // Ensure token matches user email
      if (user.oAuthToken !== token) {
        res.json({ success: false, message: `oAuth tokens do not match` })
        return
      }

      // Valid token, valid user, return user details
      let apiToken = await generateAPIToken(user, app)
      res.json({ success: true, user, token: apiToken })
    }
    catch (e) {
      console.log(e)
      res.status(500).json({ message: e })
    }
  })
}
