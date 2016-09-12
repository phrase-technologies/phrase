import r from 'rethinkdb'
import chalk from 'chalk'
import { generateUniqueToken } from './helpers/token'

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
  await r.table(`users`).indexCreate(`oAuthToken`).run(db)

  await r.tableCreate(`phrases`).run(db)
  await r.table(`phrases`).indexCreate(`phrasename`).run(db)
  await r.table(`phrases`).indexCreate(`userId`).run(db)

  await r.tableCreate(`inviteCodes`).run(db)
  await r.table(`inviteCodes`).indexCreate(`userId`).run(db)
  await r.table(`inviteCodes`).indexCreate(`code`).run(db)

  for(let i = 0; i < 100; i++) {
    let token = await generateUniqueToken({ db })
    await r.table(`inviteCodes`).insert({
      code: token,
      used: false,
    }).run(db)
  }

  console.log(chalk.cyan(
    `Database setup complete!`
  ))
}
