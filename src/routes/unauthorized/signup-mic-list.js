import r from 'rethinkdb'
import isValidEmail from '../../helpers/isEmail'
import { createEmailContact, addToMicrophoneLineInList } from '../../helpers/sendInBlue'

export default ({ api, db }) => {
  api.post(`/signup-mic-list`, async (req, res) => {
    try {
      let { email } = req.body

      if (!isValidEmail(email)) {
        res.json({ success: false })
      }
      else {
        let cursor = await r.table(`users`)
          .getAll(email.toLowerCase(), { index: `email` })
          .limit(1)
          .run(db)

        let users = await cursor.toArray()
        let user = users[0]

        if (!user) await createEmailContact({ email })
        addToMicrophoneLineInList({ email })

        res.json({ success: true })
      }
    }
    catch (err) { console.log(err) }
  })
}
