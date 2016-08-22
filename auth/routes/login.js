import r from 'rethinkdb'
import { generateAPIToken } from '../../helpers/token'
import doubleHash from '../../helpers/doubleHash'

export default ({ api, app, db }) => {
  api.post(`/login`, async (req, res) => {

    let { email, password } = req.body

    try {
      let lowerCaseUnameEmail = email.toLowerCase()

      let cursor = await r
        .table(`users`)
        .getAll(lowerCaseUnameEmail, { index: `email` })
        .limit(1)
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
}
