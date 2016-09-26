import r from 'rethinkdb'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import { generateUniqueToken } from '../helpers/token'

export default async ({ name, db }) => {
  console.log(chalk.yellow(
    `⌛ Setting up database..`
  ))

  await r.dbCreate(name).run(db)
  await r.tableCreate(`users`).run(db)
  await r.tableCreate(`connections`).run(db)

  await r.table(`users`).indexCreate(`usernameLC`, user =>
    r.add(user(`username`).downcase())
  ).run(db)

  await r.table(`users`).indexCreate(`email`).run(db)
  await r.table(`users`).indexCreate(`resetToken`).run(db)
  await r.table(`users`).indexCreate(`confirmToken`).run(db)

  await r.tableCreate(`phrases`).run(db)
  await r.table(`phrases`).indexCreate(`phrasename`).run(db)
  await r.table(`phrases`).indexCreate(`userId`).run(db)

  await r.tableCreate(`inviteCodes`).run(db)
  await r.table(`inviteCodes`).indexCreate(`userId`).run(db)
  await r.table(`inviteCodes`).indexCreate(`code`).run(db)

  await r.tableCreate(`oAuth`).run(db)
  await r.table(`oAuth`).indexCreate(`oAuthToken`).run(db)
  await r.table(`oAuth`).indexCreate(`email`).run(db)

  for(let i = 0; i < 100; i++) {
    let token = await generateUniqueToken({ db })
    await r.table(`inviteCodes`).insert({
      code: token,
      used: false,
    }).run(db)
  }

  await r.tableCreate(`migrations`).run(db)
  await r.table(`migrations`).indexCreate(`script`).run(db)
  let migrationScripts = fs.readdirSync(`scripts/migrations`).reduce((arr, script) => ([
    ...arr,
    { script },
  ]), [])
  await r.table(`migrations`).insert(migrationScripts).run(db)

  console.log(chalk.cyan(
    `Database setup complete!`
  ))
}
