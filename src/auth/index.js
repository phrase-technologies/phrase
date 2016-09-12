import jwt from 'jsonwebtoken'
import authRoutes from './routes'
import passport from 'passport'
import strategies from './strategies'

export default ({
  api,
  app,
  db,
}) => {

  app.use(passport.initialize())

  strategies.forEach(strategy => strategy({ app, db }))
  authRoutes.forEach(route => route({ api, app, db }))

  api.use((req, res, next) => {

    let token = req.body.token

    if (token) {
      jwt.verify(token, app.get(`superSecret`), (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: `Failed to authenticate token.` })
        }

        req.decoded = decoded

        next()
      })

    } else {

      return res.status(403).send({
        success: false,
        message: `No token provided.`,
      })
    }
  })
}
