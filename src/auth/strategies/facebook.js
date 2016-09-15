
import passport from 'passport'
import FacebookStrategy from 'passport-facebook'
import { facebookAppID, facebookAppSecret, apiURL } from '../../config'
import {
  rUserGetFromEmail,
  rOAuthInsert,
  rUserUpdate,
  rOAuthDeleteFromEmail,
} from '../../helpers/db-helpers'
import { generateUniqueToken } from '../../helpers/token'
import { completeOAuth } from '../../helpers/oAuth'

export default ({ app, db, io }) => {
  passport.use(new FacebookStrategy({
    clientID: facebookAppID,
    clientSecret: facebookAppSecret,
    callbackURL: `${apiURL}/auth/facebook/callback`,
    profileFields: [`id`, `emails`, `name`, `picture`],
  }, async (accessToken, refreshToken, profile, done) => {
      try {
        let { emails, photos } = profile
        if (!photos || !emails || !accessToken) {
          done(null, { success: false })
          return
        }

        let { value: email } = emails[0]
        let { value: picture } = photos[0]
        let lowerCaseEmail = email.toLowerCase()
        let facebook = {
          accessToken,
          refreshToken: !refreshToken ? null : refreshToken,
        }
        let oAuthToken = await generateUniqueToken({ table: `oAuth`, index: `oAuthToken`, db })
        let user = await rUserGetFromEmail(db, { email })


        await rOAuthDeleteFromEmail(db, { email })
        await rOAuthInsert(db, {
          oAuthToken,
          email,
          facebook,
          picture,
        })

        if (user) // If user exists update their info
          await rUserUpdate(db, {
            id: user.id,
            update: {
              facebook,
              picture,
            },
          })

        done(null, {
          success: true,
          email: lowerCaseEmail,
          token: oAuthToken,
          newUser: !user || !user.username,
        })
      }
      catch (e) {
        console.log(e)
        done(true)
      }
  }))

  app.get(`/auth/facebook`,
    passport.authenticate(`facebook`, {
      authType: `rerequest`,
      scope: [`public_profile`, `email`],
      display: `popup`,
    })
  )

  app.get(`/auth/facebook/callback`, (req, res, next) => {
    passport.authenticate(`facebook`,
      { session: false },
      (err, user) => { completeOAuth(res, io, err, user) },
    )(req, res, next)
  })
}
