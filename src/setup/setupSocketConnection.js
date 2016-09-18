import r from 'rethinkdb'
import chalk from 'chalk'

export default async ({ io, db }) => {

  // Clear existing socket connections upon startup
  await r.table(`connections`).delete().run(db)

  io.on(`connection`, async (socket) => {

    socket.on(`client::joinRoom`, ({ phraseId, username }) => {
      // Leave all other rooms first
      Object.keys(socket.rooms).forEach(room => {
        if (room !== phraseId)
          socket.leave(room)
      })

      // Then join this room
      socket.join(phraseId)

      // Indicate Presence
      let room = io.sockets.adapter.rooms[phraseId]
      socket.username = username // TODO... track which user for presence
      socket.broadcast.emit(`server::updatePresence`, room) // TODO... not properly implemented

      console.log(chalk.yellow(
        `⚡ Someone joined ${phraseId}!`
      ))
    })

    socket.on(`disconnect`, async () => {
      try { await r.table(`connections`).get(socket.id).delete().run(db) }
      catch (e) { console.log(chalk.magenta(e)) }

      let count = await r.table(`connections`).count().run(db)

      console.log(chalk.magenta(
        `⚡ Disconnection! Number of open connections: ${count}`
      ))
    })

    // Setup `on` handlers synchronously in order for tests to work. 

    try { await r.table(`connections`).insert({ id: socket.id }).run(db) }
    catch (e) { console.log(chalk.white(e)) }

    let count = await r.table(`connections`).count().run(db)

    console.log(chalk.yellow(
      `⚡ New connection! Number of open connections: ${count}`
    ))

  })
}
