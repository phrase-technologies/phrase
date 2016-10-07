import fs from 'fs'
import path from 'path'
import readChunk from 'read-chunk'
import fileType from 'file-type'

export default ({ api }) => {
  api.post(`/uploadTrackAudio`, async (req, res) => {
    let file
    if (!req.files || !(file = req.files[0])) {
      return res.json({
        error: `Missing audio file`,
        message: `Please try again`,
      })
    }
    let extensions = [ `mp3` ]
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
    let { phraseId } = req.body
    let fileName = `${phraseId}_${Date.now()}.${extension}`
    let filePath = path.join(`public/audio-tracks`, fileName)
    try {
      fs.renameSync(file.path, filePath)
    }
    catch(error) {
      if (fs.existsSync(file.path))
        fs.unlink(file.path)
      return res.status(500).json({ error })
    }

    return res.json({ success: true, audioFile: fileName })
  })
}
