import jwt from 'jsonwebtoken'
import User from '../models/User'

export default ({
  api,
  app,
}) => {
  app.post(`/signup`, (req, res) => {

    let { email, password } = req.body

    if (email && password) {
      User.findOne({ email }, (err, user) => {
        if (err) throw err
        if (user) res.json({
          success: false,
          message: `An account with this email already exists.`,
        })
        else {

          /*
           *  TODO: hash password
           */

          let user = new User({ email, password, plan: `free` })

          user.save((err, user) => {
            if (err) throw err
            res.json({ success: true, user })
          })
        }
      })
    } else res.json({
      success: false,
      message: `Must provide email and password.`,
    })
  })

  api.post(`/login`, (req, res) => {

    let { email, password } = req.body

    User.findOne({ email }, (err, user) => {

      if (err) throw err

      if (!user) {
        res.json({
          success: false,
          message: `User not found.`,
        })
      } else if (user.password !== password) {
        res.json({
          success: false,
          message: `Bad email/password combination.`,
        })
      } else {
        let token = jwt.sign(user, app.get(`superSecret`), {
          expiresInMinutes: 1440, // expires in 24 hours
        })

        res.json({
          success: true,
          message: `Enjoy your token!`,
          token,
          user,
        })
      }
    })
  })

  api.use((req, res, next) => {

    let token = req.body.token

    if (token) {
      jwt.verify(token, app.get(`superSecret`), (err, decoded) => {
        if (err) {
          return res.json({ success: false, message: `Failed to authenticate token.` })
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
