import _ from 'lodash'
import r from 'rethinkdb'

import { getUsers, setUsers } from '../../setup/setupSocketConnection'
import {
  rCollaboratorGet,
  rCollaboratorInsert,
  rCollaboratorDelete,
  rUserGet,
  rInviteCodeGenerate,
} from '../../helpers/db-helpers'
import isValidEmail from '../../helpers/isEmail'
import {
  inviteCollaborator as emailCollaborator,
  inviteEmailCollaborator,
} from '../../helpers/email-helpers'

export default ({ api, db, io }) => {
  api.post(`/collab/add`, async (req, res) => {
    let { phraseId, userId, targetUserId, targetUserEmail } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let author = await phrase.getField(`userId`).run(db)
      let collaboratorUserIds = await rCollaboratorGet(db, { phraseId })

      if (author !== userId) {
        throw Error(`You do not have permission to change this setting.`)
      }

      // Handle add collaborator by id
      let targetUser
      if (targetUserId) {
        targetUser = await rUserGet(db, { id: targetUserId })
        if (!targetUser) {
          return res.json({ success: false, message: `Target user does not exist.` })
        }

      // Handle add collaborator by email
      } else {
        if (!isValidEmail(targetUserEmail))
          return res.json({ success: false, message: `Invalid target email.` })

        let userCursor = await r.table(`users`).filter(row =>
          row(`email`).match(targetUserEmail)
        ).run(db)
        let users = await userCursor.toArray()
        targetUser = users[0]

        // Turns out this email already belongs to a user
        if (targetUser)
          targetUserId = targetUser.id
      }

      if (collaboratorUserIds.includes(targetUserId) || author === targetUserId) {
        return res.json({ message: `User is already a collaborator on this phrase.` })
      }

      await rCollaboratorInsert(db, {
        userId: targetUserId || targetUserEmail,
        phraseId,
      })

      let authorUser = await rUserGet(db, { id: author })
      if (targetUserId) {
        emailCollaborator({
          user: targetUser,
          author: authorUser,
          phraseId,
        })
      }
      else {
        let token = await rInviteCodeGenerate(db)
        inviteEmailCollaborator({
          email: targetUserEmail,
          token,
          author: authorUser,
          phraseId,
        })
        console.log(token)
      }

      io.emit(`server::collaboratorAdded`, {
        phraseId,
        userId: targetUserId || targetUserEmail,
        username: targetUser ? targetUser.username : targetUserEmail,
      })

      let users = getUsers()
      let userInSocketArray = users.find(x => x.userId === targetUserId)

      if (userInSocketArray) {
        let nextUsers = setUsers([
          ...users.filter(x => x.userId !== targetUserId),
          { ...userInSocketArray, room: phraseId },
        ])

        io.in(phraseId).emit(
          `server::updatePresence`,
          _.uniqBy(nextUsers, `userId`)
            .filter(x => x.room === phraseId)
            .map(x => ({ username: x.username, userId: x.userId })),
        )
      }

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
      let collaboratorUserIds = await rCollaboratorGet(db, { phraseId })
      let privacySetting = await phrase.getField(`privacySetting`).run(db)

      // Only author or can remove or collaborator can remove themselves.
      if (author !== userId && !collaboratorUserIds.includes(userId)) {
        throw Error(`You do not have permission to change this setting.`)
      }

      await rCollaboratorDelete(db, { phraseId, userId: targetUserId })

      let users = getUsers()

      let nextUsers = setUsers(
        users.map(x => ({
          ...x,
          room: privacySetting === `public` || author === userId
            ? phraseId
            : null,
        }))
      )

      io.in(phraseId).emit(`server::collaboratorLeft`, {
        phraseId,
        userId: targetUserId,
        privacySetting,
      })

      io.in(phraseId).emit(
        `server::updatePresence`,
        _.uniqBy(nextUsers, `userId`)
          .filter(x => x.room === phraseId)
          .map(x => ({ username: x.username, userId: x.userId })),
      )

      if (userId === author) {
        res.json({ success: true, message: `Collaborator removed.` })
      } else res.json({ success: true, message: `Collaborator left.` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }

  })
}
