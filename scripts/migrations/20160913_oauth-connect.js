import r from 'rethinkdb'

export default async ({ db }) => {
  await r.tableCreate(`oAuth`).run(db)
  await r.table(`oAuth`).indexCreate(`oAuthToken`).run(db)
  await r.table(`oAuth`).indexCreate(`email`).run(db)
}
