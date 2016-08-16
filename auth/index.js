import jwt from 'jsonwebtoken'
import isValidEmail from '../helpers/isEmail'
import isValidUsername from '../helpers/isUsername'
import isValidPassword from '../helpers/isPassword'
import r from 'rethinkdb'
import crypto from 'crypto'
import { secret } from '../config'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../helpers/emailHelper'

let hash = password => crypto.createHmac(`sha256`, secret)
  .update(password)
  .digest(`hex`)

let doubleHash = password => hash(hash(password))

let generateUniqueToken = async ({ index, db }) => {
  let nBytes = 3
  let token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()
  while(true) {
    let cursor = await r.table(`users`)
      .getAll(token, { index })
      .limit(1)
      .run(db)
    let users = await cursor.toArray()
    if (users[0]) token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()
    else break
  }
  return token
}

let generateAPIToken = async (user, app) => {
  return await jwt.sign(user, app.get(`superSecret`), {
    expiresIn: `365d`, // expires in a year
  })
}

export default ({
  api,
  app,
  db,
}) => {
  app.post(`/signup`, async (req, res) => {

    let { inviteCode, email, username, password } = req.body

    let trimmedInviteCode = inviteCode.trim()
    let trimmedEmail = email.trim()
    let trimmedUsername = username.trim()
    let trimmedPassword = password.trim()

    // Validate Invite Code
    if (!inviteCode) {
      res.json({ message: { inviteCodeError: `Invite Code is required.` } })
    }

    try {
      let inviteCodeResults = await r
        .table(`inviteCodes`)
        .getAll(trimmedInviteCode, { index: `code` })
        .limit(1)
        .run(db)
      let foundInviteCode = await inviteCodeResults.toArray()
      if (!foundInviteCode[0]) {
        res.json({ message: { inviteCodeError: `Invalid Code.` } })
        return
      } else if (foundInviteCode[0].used) {
        res.json({ message: { inviteCodeError: `Expired or Used Code.` } })
        return
      }
    }
    catch (err) {
      console.log(err)
      res.json({ inviteCodeError: `Database Error.` })
      return
    }

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
            message: { usernameError: `Usernames may only contain letters, numbers, and underscores.` },
          })
        } else if (trimmedUsername.length > 20) {
          res.json({
            success: false,
            message: { usernameError: `Usernames may be at most 20 characters long.`},
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
          } else if (!trimmedPassword || !isValidPassword(trimmedPassword)) {
            res.json({
              success: false,
              message: { passwordError: `Passwords must be at least 6 characters long` },
            })
          } else {
            let token = await generateUniqueToken({ index: `confirmToken`, db })
            let user = await r.table(`users`).insert({
              username: trimmedUsername,
              email: lowerCaseEmail,
              password: doubleHash(trimmedPassword),
              confirmToken: token,
            }).run(db)
            r.table(`inviteCodes`)
              .getAll(trimmedInviteCode, { index: `code` })
              .limit(1)
              .update({used: true})
              .run(db)

            sendWelcomeEmail({
              username: trimmedUsername,
              email: lowerCaseEmail,
              confirmToken: token,
            })

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
      let lowerCaseUnameEmail = email.toLowerCase()
      let cursor = await r.table(`users`).getAll(lowerCaseUnameEmail, { index: `email` }).limit(1)
        .union(r.table(`users`).getAll(lowerCaseUnameEmail, { index: `usernameLC` }).limit(1))
        .run(db)
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
          message: `Bad username or email / password combination.`,
        })
      } else if (user.confirmToken) {
        res.json({
          success: false,
          confirmFail: true,
          message: `Email address not yet confirmed, please `,
        })
      }
      else {
        let token = await generateAPIToken(user, app)
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

  app.post(`/forgot-password`, async (req, res) => {
    try {
      let { email } = req.body
      let lowerCaseEmail = email.toLowerCase()
      let cursor = await r.table(`users`)
        .getAll(lowerCaseEmail, { index: `email` })
        .limit(1)
        .run(db)
      let users = await cursor.toArray()
      let user = users[0]

      if(!user) {
        res.json({
          success: false,
          message: { emailError: `Email not found.` },
        })
      } else {
        let token = await generateUniqueToken({ index: `resetToken`, db })
        r.table(`users`)
          .getAll(lowerCaseEmail, { index: `email`})
          .limit(1)
          .update({resetToken: token})
          .run(db)
        sendPasswordResetEmail({ username: user.username, email: user.email, resetToken: token })
        res.json({
          success: true,
        })
      }
    }
    catch (err) { console.log(err) }
  })

  app.post(`/new-password`, async (req, res) => {
    try {
      let { email, resetToken, password, confirmPassword } = req.body
      let lowerCaseEmail = email.toLowerCase()
      let cursor = await r.table(`users`)
        .getAll(lowerCaseEmail, { index: `email` })
        .limit(1)
        .run(db)
      let users = await cursor.toArray()
      let user = users[0]

      if(!user || user.resetToken !== resetToken) {
        res.json({
          success: false,
          message: { linkError: `Invalid email, please ` },
        })
      }
      else {
        let trimmedPassword = password.trim()
        let trimmedConfirmPassword = confirmPassword.trim()

        if (!trimmedPassword || !isValidPassword(trimmedPassword)) {
          res.json({
            success: false,
            message: { passwordError: `Passwords must be at least 6 characters long` },
          })
        }
        else if (trimmedPassword !== trimmedConfirmPassword) {
          res.json({
            success: false,
            message: { confirmPasswordError: `Passwords do not match` },
          })
        }
        else {
          r.table(`users`).getAll(lowerCaseEmail, { index: `email`}).limit(1)
            .update({ password: doubleHash(trimmedPassword)})
            .run(db)
          r.table(`users`).getAll(lowerCaseEmail, { index: `email`}).limit(1)
            .replace(r.row.without(`resetToken`))
            .run(db)

          res.json({
            success: true,
          })
        }
      }
    }
    catch (err) { console.log(err) }
  })

  app.post(`/confirm-user`, async (req, res) => {
    try {
      let { email, confirmToken } = req.body
      let lowerCaseEmail = email.toLowerCase()
      let cursor = await r.table(`users`)
        .getAll(lowerCaseEmail, { index: `email` })
        .limit(1)
        .run(db)
      let users = await cursor.toArray()
      let user = users[0]

      if(!user || user.confirmToken !== confirmToken)
        res.json({ success: false, message: `Invalid code, please try again` })
      else {
        r.table(`users`).getAll(lowerCaseEmail, { index: `email`}).limit(1)
          .replace(r.row.without(`confirmToken`))
          .run(db)
        let token = await generateAPIToken(user, app)
        res.json({
          success: true,
          token,
          user,
        })
      }
    }
    catch (err) { console.log(err) }
  })

  app.post(`/retry-confirm-user`, async (req, res) => {
    try {
      let { email } = req.body
      let lowerCaseEmail = email.toLowerCase()
      let cursor = await r.table(`users`)
        .getAll(lowerCaseEmail, { index: `email` })
        .limit(1)
        .run(db)
      let users = await cursor.toArray()
      let user = users[0]

      if(!user)
        res.json({
          success: false,
          message: `Email not found, please try again`,
        })
      else {
        let token = await generateUniqueToken({ index: `confirmToken`, db })
        r.table(`users`)
          .getAll(lowerCaseEmail, { index: `email`})
          .limit(1)
          .update({confirmToken: token})
          .run(db)
        sendWelcomeEmail({
          username: user.username,
          email: user.email,
          confirmToken: token,
        })
        res.json({ success: true })
      }
    }
    catch (err) { console.log(err) }
  })

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
