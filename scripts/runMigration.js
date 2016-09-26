import r from 'rethinkdb'
import path from 'path'

export default async ({ migration }) => {
  if (!migration) {
    console.log(`Please run with 'npm run migrate <<script-name>>'.`)
    return
  }

  try {
    let script = path.basename(process.argv[1])
    let db = await r.connect({ host: `localhost`, db: `phrase`, port: 28015 })
    await migration({ db })
    await r.table('migrations').insert({ script }).run(db)
  }
  catch (e) {
    console.log(`Migration failed: ${e}`)
  }
  console.log(`Done! Feel free to kill the script.`)
}
