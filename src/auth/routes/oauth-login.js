
import {
  rUserGetFromEmail,
  rOAuthGetFromEmail,
  rOAuthDeleteFromEmail,
} from '../../helpers/db-helpers'
import { generateAPIToken } from '../../helpers/token'

export default ({ app, db }) => {
  app.post(`/oauth-login`, async (req, res) => {
    let { token, email } = req.body

    if (!token && email) {
      res.json({ success: false, message: `Missing oAuth token, please try again.`})
      return
    }

    if (!email && token) {
      res.json({ success: false, message: `Missing email, please try again.`})
      return
    }

    if (!email && !token) {
      res.json({ success: false, message: `Missing email and oAuth token, please try again.`})
      return
    }

    try {
      let user = await rUserGetFromEmail(db, { email })
      if (!user) {
        res.json({ success: false, message: { oAuthError: `User not found, please sign up.` }})
        return
      }

      let oAuth = await rOAuthGetFromEmail(db, { email })
      if (!oAuth) {
        res.json({
          success: false,
          message: { oAuthError: `oAuth authentication failed, please try again.` },
        })
        return
      }
      if (oAuth.oAuthToken !== token) {
        res.json({
          success: false,
          message: { oAuthError: `oAuth tokens do not match, please try again.` },
        })
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
