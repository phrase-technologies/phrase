import jwt from 'jsonwebtoken'
import isValidEmail from '../helpers/isEmail'
import isValidUsername from '../helpers/isUsername'
import r from 'rethinkdb'
import crypto from 'crypto'
import { secret } from '../config'

let hash = password => crypto.createHmac(`sha256`, secret)
  .update(password)
  .digest(`hex`)

let doubleHash = password => hash(hash(password))

export default ({
  api,
  app,
  db,
}) => {
  app.post(`/signup`, async (req, res) => {

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

      try {
        let lowerCaseEmail = trimmedEmail.toLowerCase()
        let userByEmailResults = await r
          .table(`users`)
          .getAll(lowerCaseEmail, { index: `email` })
          .limit(1)
          .run(db)
        let userByEmail = await userByEmailResults.toArray()

        if (userByEmail.length) {
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
          let userByUsernameResults = await r
            .table(`users`)
            .getAll(trimmedUsername.toLowerCase(), { index: `usernameLC` })
            .limit(1)
            .run(db)
          let userByUsername = await userByUsernameResults.toArray()

          if (userByUsername.length) {
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
            let user = await r.table(`users`).insert({
              username: trimmedUsername,
              email: lowerCaseEmail,
              password: doubleHash(trimmedPassword),
            }).run(db)

            console.log(`${username} signed up!`)

            res.json({ success: true, user })
          }
        }
      }
      catch (err) {
        console.log(err)
        res.json({ success: false })
      }
    }
  })

  api.post(`/login`, async (req, res) => {

    let { email, password } = req.body

    try {

      let cursor = await r.table(`users`).getAll(email, { index: `email` }).limit(1).run(db)
      let users = await cursor.toArray()
      let user = users[0]

      if (!user) {
        res.json({
          success: false,
          message: `User not found.`,
        })
      } else if (user.password !== doubleHash(password.trim())) {
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
    }

    catch (err) { console.log(err) }
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
