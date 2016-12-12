import r from 'rethinkdb'
import { resetPassword as sendPasswordResetEmail } from '../../helpers/email-helpers'
import { generateUniqueToken } from '../../helpers/token'

export default ({ app, db }) => {
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

      if (!user) {
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

        sendPasswordResetEmail({
          username: user.username,
          email: user.email,
          resetToken: token,
        })

        res.json({
          success: true,
        })
      }
    }
    catch (err) { console.log(err) }
  })
}
