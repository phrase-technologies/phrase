import r from 'rethinkdb'

export default ({ api, db }) => {
  api.post(`/searchUsers`, async (req, res) => {
    let { searchTerm } = req.body

    if (!searchTerm) {
      return res.json({ success: false, message: `Search term cannot be empty.`})
    }

    let userCursor = await r.table(`users`).filter(row =>
      row(`username`).match(searchTerm).or(row(`email`).match(searchTerm))
    ).run(db)

    let users = await userCursor.toArray()

    res.json({
      succcess: true,
      message: `Users found`,
      users: users.map(user => ({ username: user.username })),
    })
  })
}
