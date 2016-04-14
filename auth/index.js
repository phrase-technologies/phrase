import jwt from 'jsonwebtoken'
import User from '../models/User'
import isValidEmail from '../helpers/isEmail'
import isValidUsername from '../helpers/isUsername'

export default ({
  api,
  app,
}) => {
  app.post(`/signup`, (req, res) => {

    let { email, username, password } = req.body

    let trimmedEmail = email.trim()
    let trimmedUsername = username.trim()
    let trimmedPassword = password.trim()

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      res.json({
        success: false,
        message: { emailError: `Invalid email.` },
      })
    } else {
      User.findOne({ email }, (err, user) => {
        if (err) throw err
        if (user) {
          res.json({
            success: false,
            message: { emailError: `An account with this email already exists.` },
          })
        } else if (!trimmedUsername || !isValidUsername(trimmedUsername)) {
          res.json({
            success: false,
            message: { usernameError: `Invalid username.` },
          })
        } else {
          User.findOne({ username }, (err, user) => {
            if (err) throw err
            if (user) {
              res.json({
                success: false,
                message: { usernameError: `Sorry, the username "${username}" is taken.` },
              })
            } else if (!trimmedPassword) {
              res.json({
                success: false,
                message: { passwordError: `Invalid password.` },
              })
            } else {
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
        }
      })
    }
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
