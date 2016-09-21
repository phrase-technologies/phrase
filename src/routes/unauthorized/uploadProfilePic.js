import fs from 'fs'
import path from 'path'
import multer from 'multer'

import { apiURL } from '../../config'
import { rUserUpdate } from '../../helpers/db-helpers'
import { validateAPIToken } from '../../helpers/token'

let destRoot = 'public'
let destSub = 'profile'
let upload = multer({ dest: path.join(destRoot, destSub) })

export default ({ api, db, app }) => {
  api.post(`/uploadProfilePic`, upload.single('profilePhoto'), async (req, res) => {
    let file = req.file
    try {
      // This route is unauthorized because it uses formData, not json
      // Manually validate JWT
      let { token } = req.body
      let result = await validateAPIToken({ app, token })
      if (!result.success) {
        fs.unlink(file.path)
        return res.status(403).json(result)
      }

      let { id: userId } = result.decoded
      let fileName = `${userId}${path.extname(file.originalname)}`
      fs.rename(file.path, path.join(destRoot, destSub, fileName))
      rUserUpdate(db, {
        id: userId,
        update: { picture: `${apiURL}/${destSub}/${fileName}` },
      })
      return res.json({ success: true })
    }
    catch (error) {
      fs.unlink(file.path)
      res.status(500).end()
    }
  })
}
