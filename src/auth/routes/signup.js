import {
  rUserInsert,
  rUserGetFromEmail,
  rUserGetFromUsername,
  rInviteCodeGetFromCode,
  rInviteCodeUpdateMarkUsed,
  rOAuthGetFromEmail,
  rOAuthDeleteFromEmail,
} from '../../helpers/db-helpers'

import { generateUniqueToken } from '../../helpers/token'
import isValidEmail from '../../helpers/isEmail'
import isValidUsername from '../../helpers/isUsername'
import isValidPassword from '../../helpers/isPassword'
import { sendWelcomeEmail } from '../../helpers/emailHelper'
import doubleHash from '../../helpers/doubleHash'

export default ({ app, db }) => {
  app.post(`/signup`, async (req, res) => {
    let { inviteCode, email, username, password, oAuthToken } = req.body

    // Validate Invite Code
    if (!inviteCode) {
      res.json({ message: { inviteCodeError: `Invite Code is required.` } })
      return
    }

    try {
      let trimmedInviteCode = inviteCode.trim()
      let trimmedEmail = email.trim()
      let trimmedUsername = username.trim()
      let trimmedPassword = password.trim()

      let inviteCodeResult = await rInviteCodeGetFromCode(db, { inviteCode: trimmedInviteCode })

      if (!inviteCodeResult) {
        res.json({ message: { inviteCodeError: `Invalid Code.` } })
        return
      } else if (inviteCodeResult.used) {
        res.json({ message: { inviteCodeError: `Expired or Used Code.` } })
        return
      }

      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        res.json({
          success: false,
          message: { emailError: `Invalid email.` },
        })
        return
      }

      let lowerCaseEmail = trimmedEmail.toLowerCase()
      let user = await rUserGetFromEmail(db, { email: lowerCaseEmail })
      if (user) {
        res.json({
          success: false,
          message: { emailError: `An account with this email already exists.` },
        })
        return
      }
      if (!trimmedUsername || !isValidUsername(trimmedUsername)) {
        res.json({
          success: false,
          message: {
            usernameError: `Usernames may only contain letters, numbers, and underscores.`,
          },
        })
        return
      }
      if (trimmedUsername.length > 20) {
        res.json({
          success: false,
          message: { usernameError: `Usernames may be at most 20 characters long.`},
        })
        return
      }

      let userByUsername = await rUserGetFromUsername(db, { username: trimmedUsername })

      if (userByUsername) {
        res.json({
          success: false,
          message: { usernameError: `Sorry, the username "${username}" is taken.` },
        })
        return
      }

      let oAuth = await rOAuthGetFromEmail(db, { email: lowerCaseEmail })
      if (oAuthToken) {
        if (!oAuth) {
          res.json({
            success: false,
            message: { emailError: `An oAuth error ocurred, please try again` },
          })
          return
        }
        if (oAuthToken !== oAuth.oAuthToken) {
          res.json({
            success: false,
            message: { oAuthError: `Invalid oAuthToken, please try again` },
          })
          return
        }
        delete oAuth.dateCreated
        delete oAuth.id
        delete oAuth.oAuthToken
        delete oAuth.email
        rUserInsert(db, {
          username: trimmedUsername,
          email: lowerCaseEmail,
          ...oAuth,
        })
      }
      else {
        if (!trimmedPassword || !isValidPassword(trimmedPassword)) {
          res.json({
            success: false,
            message: { passwordError: `Passwords must be at least 6 characters long` },
          })
          return false
        }
        if (oAuth) await rOAuthDeleteFromEmail(db, { email: lowerCaseEmail })
        let token = await generateUniqueToken({ index: `confirmToken`, db })
        rUserInsert(db, {
          username: trimmedUsername,
          email: lowerCaseEmail,
          password: doubleHash(trimmedPassword),
          confirmToken: token,
        })
        sendWelcomeEmail({
          email: lowerCaseEmail,
          username: trimmedUsername,
          confirmToken: token,
        })
      }

      rInviteCodeUpdateMarkUsed(db, { inviteCode: trimmedInviteCode })

      console.log(`${trimmedUsername} signed up!`)

      res.json({ success: true })
    }
    catch (err) {
      console.log(err)
      res.json({ success: false })
    }
  })
}
