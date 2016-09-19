import r from 'rethinkdb'

export default ({ api, db, io }) => {
  api.post(`/collab/add`, async (req, res) => {
    let { phraseId, userId, targetUserId } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let author = await phrase.getField(`userId`).run(db)
      let collaborators = await phrase.getField(`collaborators`).run(db)

      let targetUser = await r.table(`users`).get(targetUserId).run(db)

      if (!targetUser) {
        return res.json({ success: false, message: `Target user does not exist.` })
      }

      if (collaborators.includes(targetUserId)) {
        return res.json({ message: `User is already a collaborator on this phrase.` })
      }

      if (author !== userId) {
        throw Error(`You do not have permission to change this setting.`)
      }

      await phrase.update(row => ({
        collaborators: row(`collaborators`).append(targetUserId),
      })).run(db)

      io.emit(`server::collaboratorAdded`, {
        phraseId,
        userId: targetUserId,
        username: targetUser.username,
      })

      res.json({ message: `Collaborator added!` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }

  })

  api.post(`/collab/remove`, async (req, res) => {
    let { phraseId, userId, targetUserId } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let author = await phrase.getField(`userId`).run(db)
      let collaborators = await phrase.getField(`collaborators`).run(db)

      // Only author or can remove or collaborator can remove themselves.
      if (author !== userId && !collaborators.includes(userId)) {
        throw Error(`You do not have permission to change this setting.`)
      }

      await phrase.update(row => ({
        collaborators: row(`collaborators`).filter(userId => userId !== targetUserId),
      })).run(db)

      io.emit(`server::collaboratorLeft`, { phraseId, userId: targetUserId })

      if (userId === author) {
        res.json({ success: true, message: `Collaborator removed.` })
      } else res.json({ success: true, message: `Collaborator left.` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }

  })
}
