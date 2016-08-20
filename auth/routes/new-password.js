import r from 'rethinkdb'
import isValidPassword from '../../helpers/isPassword'
import doubleHash from '../../helpers/doubleHash'

export default ({ app, db }) => {
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

      if (!user || user.resetToken !== resetToken) {
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
          r.table(`users`)
            .getAll(lowerCaseEmail, { index: `email`})
            .limit(1)
            .update({ password: doubleHash(trimmedPassword)})
            .run(db)

          r.table(`users`)
            .getAll(lowerCaseEmail, { index: `email`})
            .limit(1)
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
}
