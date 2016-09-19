import r from 'rethinkdb'

export default ({ api, db, io }) => {
  api.post(`/searchUsers`, async (req, res) => {
    let { searchTerm } = req.body

    let usernameCursor = await r.table(`users`)
      .getAll(searchTerm, { index: `usernameLC` })
      .limit(5)
      .run(db)

    let emailCursor = await r.table(`users`)
      .getAll(searchTerm, { index: `email` })
      .limit(5)
      .run(db)

    let usersByUsername = await usernameCursor.toArray()
    let usersByEmail = await emailCursor.toArray()

    console.log('>>>', 'asdasdasdas', usersByEmail, usersByUsername)

    res.json({ succcess: true, message: `Users found`, users: usersByUsername })
  })
}
