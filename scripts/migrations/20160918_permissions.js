import r from 'rethinkdb'

export default async ({ db }) => {
  await r.table(`phrases`).replace(r.row.without(`public`)).run(db)
  await r.table(`phrases`).update(row => ({
    masterControl: [row(`userId`)],
    privacySetting: `private`,
    collaborators: [],
  })).run(db)
}
