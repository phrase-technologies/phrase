
import {
  rUserGetFromEmail,
  rOAuthGetFromEmail,
  rOAuthDeleteFromEmail,
} from '../../helpers/db-helpers'
import { generateAPIToken } from '../../helpers/token'

export default ({ app, db }) => {
  app.post(`/oauth-login`, async (req, res) => {
    let { token, email } = req.body

    try {
      let user = await rUserGetFromEmail(db, { email })
      if (!user) {
        res.json({ success: false, message: { oAuthError: `Invalid user email` }})
        return
      }

      let oAuth = await rOAuthGetFromEmail(db, { email })
      if (oAuth.oAuthToken !== token) {
        res.json({ success: false, message: { oAuthError: `oAuth tokens do not match` }})
        return
      }
      rOAuthDeleteFromEmail(db, { email })

      // Valid token, valid user, return user details
      let apiToken = await generateAPIToken(user, app)
      res.json({ success: true, user, token: apiToken })
    }
    catch (e) {
      console.log(e)
      res.status(500).end()
    }
  })
}
