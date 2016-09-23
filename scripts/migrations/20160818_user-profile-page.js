import r from 'rethinkdb'

export default async ({ db }) => {
  await r.table(`phrases`).indexCreate(`userId`).run(db)
}
