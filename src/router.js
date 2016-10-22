import express from 'express'
import auth from './auth'
import userCheck from './auth/userCheck'
import unauthorizedRoutes from './routes/unauthorized'
import authorizedRoutes from './routes/authorized'

export default ({ app, db, io }) => {

  let api = express.Router()

  userCheck({ api, db }) // Ensure valid user for all, not just authorized routes

  unauthorizedRoutes.forEach(route => route({ api, db, io }))

  auth({ app, api, db, io })

  authorizedRoutes.forEach(route => route({ api, db, io }))

  return api
}
