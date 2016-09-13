
import passport from 'passport'
import FacebookStrategy from 'passport-facebook'
import { facebookAppID, facebookAppSecret, apiURL } from '../../config'
import { rUserGetFromEmail, rUserInsert, rUserUpdate } from '../../helpers/db-helpers'
import { generateUniqueToken } from '../../helpers/token'
import { getOAuthCallbackURL } from '../../helpers/oAuth'

export default ({ app, db }) => {
  passport.use(new FacebookStrategy({
    clientID: facebookAppID,
    clientSecret: facebookAppSecret,
    callbackURL: `${apiURL}/auth/facebook/callback`,
    profileFields: [`id`, `emails`, `name`],
  }, async (accessToken, refreshToken, profile, done) => {
      let { emails } = profile
      if (!emails || !accessToken) {
        done(null, { success: false })
        return
      }

      // Get user by email
      let { value: email } = emails[0]
      let lowerCaseEmail = email.toLowerCase()
      let user = await rUserGetFromEmail(db, { email })

      let facebook = {
        accessToken,
        refreshToken: !refreshToken ? null : refreshToken,
      }
      let oAuthToken = await generateUniqueToken({ index: `oAuthToken`, db })

      // Add user if they don't already exist, update their tokens if they do exist
      if (!user)
        await rUserInsert(db, {
          username: null,
          email: lowerCaseEmail,
          password: null,
          facebook,
          oAuthToken,
        })
      else await rUserUpdate(db, {
          id: user.id,
          update: { oAuthToken, facebook },
        })

      done(null, {
        success: true,
        email: lowerCaseEmail,
        token: oAuthToken,
        newUser: !user || !user.username,
      })
  }))

  app.get(`/auth/facebook`,
    passport.authenticate(`facebook`, {
      authType: `rerequest`,
      scope: [`public_profile`, `email`],
      display: `popup`,
    })
  )

  app.get(`/auth/facebook/callback`, (req, res, next) => {
    passport.authenticate(`facebook`, { session: false },
      (err, user) => { res.redirect(getOAuthCallbackURL(user)) },
    )(req, res, next)
  })
}
