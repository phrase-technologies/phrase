import _ from 'lodash'
import r from 'rethinkdb'
import chalk from 'chalk'

// We have a connections table, and maybe we should switch to using that
// instead of this array at a later point, if we find a reason (eg analysis)
let users = []

export let getUsers = () => users
export let setUsers = nextUsers => {
  users = nextUsers
  return users
}

export default async ({ io, db }) => {

  io.on(`connection`, async (socket) => {

    users.push({ socketId: socket.id, username: null, userId: null, room: null })

    socket.on(`client::joinRoom`, async ({ phraseId, username, userId }) => {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      let user = users.find(x => x.socketId === socket.id)
      user.username = username
      user.userId = userId

            // Leave all other rooms first
      Object.keys(socket.rooms).forEach(room => {
        if (room !== phraseId) {
          socket.leave(room)
        }
      })

      // Then join this room if user has access
      if (
        loadedPhrase.userId === userId ||
        loadedPhrase.privacySetting === `public` ||
        loadedPhrase.collaborators.find(id => id === userId)
      ) {
        socket.join(phraseId)
        user.room = phraseId

        console.log(chalk.yellow(
          `⚡ Someone joined ${phraseId}!`
        ))
      }

      io.in(phraseId).emit(
        `server::updatePresence`,
        _.uniqBy(users, `userId`)
          .filter(x => x.room === phraseId)
          .map(x => ({ username: x.username, userId: x.userId })),
      )

    })

    socket.on(`disconnect`, () => {
      let user = users.find(x => x.socketId === socket.id)
      users = users.filter(x => x.socketId !== socket.id)

      // Indicate Presence
      if (user.room) {
        io.in(user.room).emit(
          `server::updatePresence`,
          _.uniqBy(users, `userId`)
            .filter(x => x.room === user.room)
            .map(x => ({ username: x.username, userId: x.userId })),
        )
      }

      console.log(chalk.magenta(
        `⚡ Disconnection! Number of open connections: ${users.length}`
      ))
    })

    console.log(chalk.yellow(
      `⚡ New connection! Number of open connections: ${users.length}`
    ))

    // Subscribe to changefeeds
    r.table('comments')
      .getAll(phraseId, { index: `phraseId` })
      .changes()
      .run(db, (err, cursor) => {
        socket.broadcast.emit(`server::commentsChangeFeed`, cursor)
      })

  })
}
