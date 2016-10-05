import fs from 'fs'
import path from 'path'

export default ({ api }) => {
  api.post(`/uploadTrackAudio`, async (req, res) => {
    let file
    if (!req.files || !(file = req.files[0])) {
      return res.status(500).json({ error: `Missing audio files` })
    }
    let extensions = [ `mp3` ]
    let extension = file.mimetype.replace(`audio/`, ``)
    if (!extensions.includes(extension)) {
      return res.status(500).json({ error: `Invalid audio file` })
    }
    let { phraseId, authorId, clipId } = req.body
    let fileName = `${phraseId}_${authorId}_${clipId}.${extension}`
    let filePath = path.join(`public/audio-tracks`, fileName)

    try {
      fs.renameSync(file.path, filePath)
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error })
    }

    return res.json({ success: true, audioFile: fileName })
  })
}
