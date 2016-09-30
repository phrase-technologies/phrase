import fs from 'fs'
import url from 'url'
import path from 'path'
import easyImage from 'easyimage'

import { apiURL } from '../../config'
import { rUserUpdate, rUserGet } from '../../helpers/db-helpers'

let destRoot = 'public'
let destSub = 'profile'
let fileDir = path.join(destRoot, destSub)

export default ({ api, db }) => {
  api.post(`/uploadProfilePic`, async (req, res) => {
    let { id: userId } = req.decoded
    let { base64 } = req.body

    if (!base64) return res.json({ title: `Missing base64 data url.`, message: `` })

    let extension
    let fileName = `${Date.now()}_${userId}`
    let tempPath = path.join(fileDir, `tmp_${fileName}`)

    // Save base64 data as file
    base64 = base64.replace(/^data:image\/[a-z]+;base64,/, ``)
    try {
      fs.writeFileSync(tempPath, base64, 'base64')
    }
    catch(e) {
      console.log(`/uploadProfilePic: fs.writeFileSync()`, e)
      return res.status(500).end()
    }

    try { // Perform image verification / manipulation / get file extension
      let info = await easyImage.info(tempPath)
      extension = info.type

      if(extension.includes('bmp') || extension.includes('png'))
        extension = extension.substring(0, 3) // Remove image sub-type numbers

      if (![`jpeg`, `gif`, `bmp`, `png`].includes(extension)) {
        fs.unlinkSync(tempPath)
        return res.json({
          title: `Wrong file type.`,
          message: `Please upload a .jpeg, .gif, .bmp, or .png`,
        })
      }

      if (info.width > 500 || info.height > 500)
        await easyImage.resize({ src: tempPath, dst: tempPath, width: 500, height: 500 })
    }
    catch (e) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
      return res.json({ title: `Not a valid image file`, message: `Please try again.` })
    }

    fileName = `${fileName}.${extension}`
    let pictureURL = `${apiURL}/${destSub}/${fileName}`
    let filePath = path.join(fileDir, fileName)

    try { // Photo is valid, rename it including the extension
      fs.renameSync(tempPath, filePath)
    }
    catch(e) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
      console.log(`/uploadProfilePic: fs.renameSync()`, e)
      return res.status(500).end()
    }

    try {
      let user = await rUserGet(db, { id: userId })
      if (user.picture) { // Remove user's current photo
        let existingFile = path.join(fileDir, path.basename(url.parse(user.picture).pathname))
        if(fs.existsSync(existingFile)) fs.unlinkSync(existingFile)
      }
      await rUserUpdate(db, {
        id: userId,
        update: { picture: pictureURL },
      })
    }
    catch(e) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      console.log(`/uploadProfilePic: rUserUpdate()`, e)
      return res.status(500).end()
    }

    return res.json({ success: true, picture: pictureURL })
  })
}
