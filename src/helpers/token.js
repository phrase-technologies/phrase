import r from 'rethinkdb'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export let generateUniqueToken = async ({ table, index, db }) => {
  let nBytes = 3
  let token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()
  if (!table) table = `users`

  while(true) {
    let cursor = await r.table(table)
      .getAll(token, { index })
      .limit(1)
      .run(db)

    let users = await cursor.toArray()
    if (users[0]) token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()
    else break
  }
  return token
}

export let generateAPIToken = async (user, app) => {
  return await jwt.sign(user, app.get(`superSecret`), {
    expiresIn: `365d`, // expires in a year
  })
}
