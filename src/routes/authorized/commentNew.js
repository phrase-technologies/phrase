import r from 'rethinkdb'

export default ({ api, db }) => {
  api.post(`/commentNew`, async (req, res) => {
    let {
      phraseId,
      trackId,
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

    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      // TODO - all collaborators should be allowed (once Alex's branch merged in), not just author
      if (loadedPhrase.userId !== id) {
        return res.status(403).end()
      }

      let timestamp = +new Date()
      let result = await r.table(`comments`).insert({
        comment,
        trackId,
        start,
        end,
        phraseId,
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
