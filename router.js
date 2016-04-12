import express from 'express'
import auth from './auth'

export default ({ app }) => {

  let api = express.Router()

  auth({ app, api })

  /*
   *  Everything below here requires a valid token.
   */

  api.post(`/test`, (req, res) => {
    res.json({ msg: 'authenticated!' })
  })

  return api
}
