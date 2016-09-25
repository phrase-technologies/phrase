import r from 'rethinkdb'

export default ({ api, db }) => {
  api.post(`/commentExisting`, async (req, res) => {
    let { phraseId } = req.body
    let { id } = req.decoded

    if (!phraseId) return res.json({ success: false, message: `Must provide a phraseId` })

    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      let privatePhrase = loadedPhrase.privacySetting === "private"
      let isCollaborator = loadedPhrase.collaborators.includes(id)
      let isAuthor = loadedPhrase.userId === id
      if (privatePhrase && !isCollaborator && !isAuthor) {
        return res.status(403).json({ message: `You do not have access.` })
      }

      let commentsCursor = await r
        .table(`comments`)
        .getAll(phraseId, { index: `phraseId` })
        .orderBy('start')
        .run(db)
      let comments = await commentsCursor.toArray()

      res.json({ success: true, message: `Comments galore!`, comments })
    }

    catch (error) {
      res.json({ success: false, message: error.toString() })
    }
  })
}
