import passport from 'passport'
import jwt from 'jsonwebtoken'

import authRoutes from './routes'
import strategies from './strategies'

export default ({
  api,
  app,
  db,
  io,
}) => {

  app.use(passport.initialize())

  strategies.forEach(strategy => strategy({ app, db, io }))
  authRoutes.forEach(route => route({ api, app, db }))

  api.use((req, res, next) => {

    let { token, userId } = req.body

    if (token) {
      jwt.verify(token, app.get(`superSecret`), (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: `Failed to authenticate token.` })
        }

        if (decoded.id !== userId) {
          return res.status(401).json({ message: `User ID does not match JWT.` })
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
