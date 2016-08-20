import r from 'rethinkdb'
import { generateAPIToken } from '../../helpers/token'
import { createEmailContact } from '../../helpers/emailHelper'

export default ({ app, db }) => {
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

      if(!user || user.confirmToken !== confirmToken) {
        res.json({ success: false, message: `Invalid code, please try again` })
      }
      else {
        r.table(`users`)
          .getAll(lowerCaseEmail, { index: `email` })
          .limit(1)
          .replace(r.row.without(`confirmToken`))
          .run(db)

        createEmailContact({
          email: user.email,
          username: user.username,
          userId: user.id,
        })

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
}
