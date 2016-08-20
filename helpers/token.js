import r from 'rethinkdb'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export let generateUniqueToken = async ({ index, db }) => {
  let nBytes = 3
  let token = crypto.randomBytes(nBytes).toString(`hex`).toUpperCase()

  while(true) {
    let cursor = await r.table(`users`)
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
