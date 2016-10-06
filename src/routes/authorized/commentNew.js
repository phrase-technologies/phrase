import r from 'rethinkdb'

export default ({ api, db }) => {
  api.post(`/commentNew`, async (req, res) => {
    let {
      phraseId,
      trackId,
      parentId,
      comment,
      tempKey,
      start = null,
      end = null,
    } = req.body
    let { id } = req.decoded
    let isInt = Number.isInteger

    if (!comment)        return res.json({ success: false, message: `Invalid comment` })
    if (!isInt(trackId)) return res.json({ success: false, message: `Must provide trackId` })
    if (!phraseId)       return res.json({ success: false, message: `Must provide a phraseId` })
    if (!tempKey)        return res.json({ success: false, message: `Must provide a tempKey` })

    // Flip start/end if necessary
    if (start !== null && end !== null && end < start) {
      [start, end] = [end, start]
    }

    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      let privatePhrase = loadedPhrase.privacySetting === "private"
      let isCollaborator = loadedPhrase.collaborators.includes(id)
      let isAuthor = loadedPhrase.userId === id
      if (privatePhrase && !isCollaborator && !isAuthor) {
        return res.status(403).json({ message: `You do not have permission to comment.` })
      }

      let timestamp = +new Date()
      let result = await r.table(`comments`).insert({
        comment,
        trackId,
        start,
        end,
        phraseId,
        parentId,
        authorId: id,
        tempKey,
        dateCreated: timestamp,
        dateModified: timestamp,
      }).run(db)

      if (result.errors.length) {
        res.json({ success: false, message: result.first_error })
      }

      res.json({ success: true, message: `Comment added!` })
    }

    catch (error) {
      res.json({ success: false, message: error.toString() })
    }
  })
}
