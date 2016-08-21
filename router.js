import express from 'express'
import auth from './auth'
import unauthorizedRoutes from './routes/unauthorized'
import authorizedRoutes from './routes/authorized'

export default ({ app, db, io }) => {

  let api = express.Router()

  unauthorizedRoutes.forEach(route => route({ api, db, io }))

  auth({ app, api, db })

  authorizedRoutes.forEach(route => route({ api, db, io }))

  return api
}
