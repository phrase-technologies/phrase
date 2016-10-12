import fs from 'fs'
import path from 'path'
import readChunk from 'read-chunk'
import fileType from 'file-type'
import ffmpeg from 'fluent-ffmpeg'

import { rPhraseGet } from '../../helpers/db-helpers'

export default ({ api, db }) => {
  api.post(`/uploadTrackAudio`, async (req, res) => {
    let file
    try {
      if (!req.files || !(file = req.files[0])) {
        return res.json({
          error: `Missing audio file`,
          message: `Please try again`,
        })
      }

      let { phraseId } = req.body
      let { id } = req.decoded
      if (!phraseId) {
        fs.unlink(file.path)
        return res.json({
          title: `Missing phraseId`,
          message: ``,
        })
      }

      let phrase = await rPhraseGet(db, { phraseId })
      if (!phrase) {
        fs.unlink(file.path)
        return res.status(404).json({ message: `Invalid phraseId` })
      }
      let isAuthor = phrase.userId === id
      if (!phrase.collaborators.includes(id) && !isAuthor) {
        fs.unlink(file.path)
        return res.status(403).json({ message: `You do not have permission to edit this phrase` })
      }

      let extensions = [ `mp3`, `wav`, `ogg`, `m4a` ]
      let extension
      try {
        let buffer = readChunk.sync(file.path, 0, 262)
        extension = fileType(buffer).ext // Validate audio file type by magic numbers
      }
      catch (e) {
        fs.unlink(file.path)
        return res.status(500)
      }

      if (!extensions.includes(extension)) {
        fs.unlink(file.path)
        return res.json({
          title: `Invalid audio file`,
          message: `Valid file types: ${extensions.join(`,`)}`,
        })
      }

      let inputPath = file.path

      if (extension === `m4a`) {
        let output = `${file.path}.mp3`
        let source = path.resolve(file.path)
        await new Promise((resolve, reject) => {
          ffmpeg({ source })
            .output(output)
            .audioChannels(2)
            .format(`mp3`)
            .on(`error`, (error) => {
              reject(error)
            })
            .on(`end`, () => {
              fs.unlinkSync(inputPath)
              inputPath = output
              extension = `mp3`
              resolve()
            })
            .run()
        })
      }


      let fileName = `${phraseId}_${Date.now()}.${extension}`
      let filePath = path.join(`public/audio-tracks`, fileName)
      try {
        fs.renameSync(inputPath, filePath)
      }
      catch(error) {
        if (fs.existsSync(file.path))
          fs.unlink(file.path)
        return res.status(500).json({ error })
      }

      return res.json({ success: true, audioFile: fileName })
    }
    catch (e) {
      if (fs.fileExistsSync(file.path))
        fs.unlink(file.path)
      console.log(e)
      return res.status(500)
    }
  })
}
