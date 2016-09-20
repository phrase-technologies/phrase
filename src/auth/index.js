import authRoutes from './routes'
import passport from 'passport'
import strategies from './strategies'
import { validateAPIToken } from '../helpers/token'

export default ({
  api,
  app,
  db,
  io,
}) => {

  app.use(passport.initialize())

  strategies.forEach(strategy => strategy({ app, db, io }))
  authRoutes.forEach(route => route({ api, app, db }))

  api.use(async (req, res, next) => {
    let token = req.body.token
    let result = await validateAPIToken({ app, token })
    if (!result.success)
      return res.status(403).json(result)
    req.decoded = result.decoded
    next()
  })
}
