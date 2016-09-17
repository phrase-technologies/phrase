import r from 'rethinkdb'
import chalk from 'chalk'

export default ({ api, db, io }) => {
  api.post(`/setPrivacySetting`, async (req, res) => {
    let { phraseId, userId, privacySetting } = req.body

    try {
      let phrase = await r.table(`phrases`).get(phraseId)
      let author = await phrase.getField(`userId`).run(db)

      if (author !== userId) {
        throw Error(`You do not have permission to change this setting.`)
      }

      let result = await phrase.update({ privacySetting }).run(db)

      // This may mean kicking some users off of a currently observed session
      // or removing an item from the library if a user is on that page
      io.emit(`server::privacySettingChanged`, { phraseId, privacySetting })

      console.log(chalk.cyan(
        `Phrase ${phraseId} ${!result.skipped
          ? `has been set to ${privacySetting}`
          : `Not found!`
        }`
      ))

      res.json({ message: `Privacy setting changed successfully.` })
    }
    catch (error) {
      res.json({ error, success: false, message: error.message })
    }

  })
}
