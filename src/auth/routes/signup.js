import r from 'rethinkdb'
import { generateUniqueToken } from '../../helpers/token'
import isValidEmail from '../../helpers/isEmail'
import isValidUsername from '../../helpers/isUsername'
import isValidPassword from '../../helpers/isPassword'
import { sendWelcomeEmail } from '../../helpers/emailHelper'
import doubleHash from '../../helpers/doubleHash'

export default ({ app, db }) => {
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
            message: {
              usernameError: `Usernames may only contain letters, numbers, and underscores.`,
            },
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
              dateCreated: new Date(),
            }).run(db)

            r.table(`inviteCodes`)
              .getAll(trimmedInviteCode, { index: `code` })
              .limit(1)
              .update({used: true})
              .run(db)

            sendWelcomeEmail({
              email: lowerCaseEmail,
              username: trimmedUsername,
              confirmToken: token,
            })

            console.log(`${trimmedUsername} signed up!`)

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
}
