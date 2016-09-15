
import passport from 'passport'
import FacebookStrategy from 'passport-facebook'
import { facebookAppID, facebookAppSecret, apiURL } from '../../config'
import { completeOAuth, handleOAuth } from '../../helpers/oAuth'

export default ({ app, db, io }) => {
  passport.use(
    new FacebookStrategy({
      clientID: facebookAppID,
      clientSecret: facebookAppSecret,
      callbackURL: `${apiURL}/auth/facebook/callback`,
      profileFields: [`id`, `emails`, `name`, `picture`],
    },
    (accessToken, refreshToken, profile, done) => {
      handleOAuth({ profile, done, db })
    }
  ))

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
      (err, user) => { completeOAuth({ res, io, err, user }) },
    )(req, res, next)
  })
}
