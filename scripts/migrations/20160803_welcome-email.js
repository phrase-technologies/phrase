import r from 'rethinkdb'

export default async ({ db }) => {
  await r.table(`users`).indexCreate(`confirmToken`).run(db)
}
