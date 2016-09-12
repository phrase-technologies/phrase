import r from 'rethinkdb'
import {
  rUserUpdateFromEmail,
  rUserGetFromEmail,
  rUserInsert,
  rInviteCodeUpdateMarkUsed,
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

    let trimmedInviteCode = inviteCode.trim()
    let trimmedEmail = email.trim()
    let trimmedUsername = username.trim()
    let trimmedPassword = password.trim()

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
        let user = await rUserGetFromEmail(db, { email: lowerCaseEmail })
        if (oAuthToken && !user) {
          res.json({
            success: false,
            message: { oAuthError: `oAuth error, please retry logging in through your provider` },
          })
        }
        else if ((!oAuthToken && user) || (oAuthToken && user.username)) {
          res.json({
            success: false,
            message: { emailError: `An account with this email already exists.` },
          })
        } else if (oAuthToken && oAuthToken !== user.oAuthToken) {
          res.json({
            success: false,
            message: { oAuthError: `Invalid oAuthToken, please try again` },
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
          } else if (!oAuthToken && (!trimmedPassword || !isValidPassword(trimmedPassword))) {
            res.json({
              success: false,
              message: { passwordError: `Passwords must be at least 6 characters long` },
            })
          }
          else {
            if (oAuthToken) {
              rUserUpdateFromEmail(db, {
                email: lowerCaseEmail,
                update: { username: trimmedUsername },
              })
            }
            else {
              let token = await generateUniqueToken({ index: `confirmToken`, db })

              rUserInsert(db, {
                username: trimmedUsername,
                email: lowerCaseEmail,
                password: doubleHash(trimmedPassword),
                confirmToken: token,
                dateCreated: new Date(),
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
        }
      }
      catch (err) {
        console.log(err)
        res.json({ success: false })
      }
    }
  })
}
