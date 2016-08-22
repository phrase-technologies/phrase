import r from 'rethinkdb'
import { generateUniqueToken } from '../../helpers/token'
import { sendWelcomeEmail } from '../../helpers/emailHelper'

export default ({ app, db }) => {
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

      if (!user) {
        res.json({
          success: false,
          message: `Email not found, please try again`,
        })
      }
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
}
