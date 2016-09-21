import r from 'rethinkdb'

export default ({ api, db, io }) => {
  api.post(`/masterControl/add`, async (req, res) => {
    let { phraseId, userId, targetUserId } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let author = await phrase.getField(`userId`).run(db)

      let targetUser = await r.table(`users`).get(targetUserId).run(db)

      if (!targetUser) {
        return res.json({ success: false, message: `Target user does not exist.` })
      }

      if (author !== userId) {
        throw Error(`You do not have permission to change this setting.`)
      }

      await phrase.update(row => ({
        masterControl: row(`masterControl`)
          .filter(() => false) // for now, remove everyone else from master control
          .append(targetUserId),
      })).run(db)

      io.in(phraseId).emit(`server::masterControlChanged`, { phraseId, targetUserId })

      res.json({ message: `User added to master control.` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }

  })

  api.post(`/masterControl/remove`, async (req, res) => {
    let { phraseId, userId /*, targetUserId*/ } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let author = await phrase.getField(`userId`).run(db)
      let masterControl = await phrase.getField(`masterControl`).run(db)

      // Only author or the person currently in master control can remove
      if (author !== userId && !masterControl.includes(userId)) {
        throw Error(`You do not have permission to change this setting.`)
      }

      await phrase.update(row => ({
        masterControl: row(`masterControl`)
          .filter(() => false) // for now, remove everyone else from master control
          .append(author),
      })).run(db)

      io.emit(`server::masterControlChanged`, { phraseId, targetUserId: author })

      res.json({ message: `User removed from master control.` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }

  })
}
