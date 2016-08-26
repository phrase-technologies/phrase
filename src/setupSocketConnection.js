import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ io, db }) => {
  io.on(`connection`, async socket => {

    try { await r.table(`connections`).insert({ id: socket.id }).run(db) }
    catch (e) { console.log(chalk.white(e)) }

    let count = await r.table(`connections`).count().run(db)

    console.log(chalk.yellow(
      `⚡ New connection! Number of open connections: ${count}`
    ))

    socket.on(`client::joinRoom`, ({ phraseId }) => {
      // Leave all other rooms first
      Object.keys(socket.rooms).forEach(room => socket.leave(room))
      // Then join this room
      socket.join(phraseId)

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
  })
}
