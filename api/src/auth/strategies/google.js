
import passport from 'passport'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'
import { googleAppID, googleAppSecret, apiURL } from '../../config'
import { completeOAuth, handleOAuth } from '../../helpers/oAuth'

export default ({ app, db, io }) => {
  passport.use(
    new GoogleStrategy({
      clientID: googleAppID,
      clientSecret: googleAppSecret,
      callbackURL: `${apiURL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      if(profile.photos) // Adjust photo size if we have a photo
        profile.photos[0] = { value: profile.photos[0].value.replace("sz=50", "sz=500")}
      handleOAuth({ profile, done, db })
    }
  ))

  app.get(`/auth/google`,
    passport.authenticate(`google`, {
      scope: `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`,
      display: `popup`,
    })
  )

  app.get(`/auth/google/callback`, (req, res, next) => {
    passport.authenticate(`google`,
      { session: false },
      (err, user, info) => { completeOAuth({ res, io, err, user, info }) },
    )(req, res, next)
  })
}
