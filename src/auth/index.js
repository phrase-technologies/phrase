import passport from 'passport'
import jwt from 'jsonwebtoken'
import multer from 'multer'

import authRoutes from './routes'
import strategies from './strategies'

import { fileWhiteList } from '../config'

export default ({
  api,
  app,
  db,
  io,
}) => {

  app.use(passport.initialize())

  strategies.forEach(strategy => strategy({ app, db, io }))
  authRoutes.forEach(route => route({ api, app, db }))

  // For security reasons only accept files if they will be handled by the endpoint
  api.use(multer({
    dest: `uploads`,
    fileFilter: async (req, file, cb) => {
      let { fieldname } = file
      let urlFileList = fileWhiteList[req.originalUrl]
      if(!urlFileList || !urlFileList.includes(fieldname)) {
        cb(null, false)
        console.log(`File rejected! req: ${req.originalUrl}, file: ${fieldname}`)
        console.log(`If you intended to upload a file, add it to the fileWhiteList in config.js.`)
      }
      else {
        cb(null, true)
      }
    },
  }).any())

  api.use((req, res, next) => {
    let { token, userId } = req.body
    if (token) {
      jwt.verify(token, app.get(`superSecret`), (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: `Failed to authenticate token.` })
        }

        if (decoded.id !== userId) {
          return res.status(401).json({ message: `User ID does not match JWT.` })
        }

        req.decoded = decoded

        next()
      })

    } else {

      return res.status(401).send({
        success: false,
        message: `No token provided.`,
      })
    }
  })
}
