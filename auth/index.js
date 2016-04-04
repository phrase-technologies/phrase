import Router from 'koa-router'
import User from '../models/User'

let router = new Router({ prefix: `/api` })

router.post(`/signup`, async ctx => {
  let { email, password } = ctx.request.body

  if (email && password) {
    User.findOne({ email }, (err, user) => {
      if (err) throw err

      if (user) ctx.body = {
        success: false,
        message: `User with this email already exists.`,
      }

      else {

        /*
         *  TODO: hash password
         */

        let user = new User({ email, password, plan: `free` })

        user.save((err, user) => {
          if (err) throw err
          ctx.body = { success: true, user }
        })
      }
    })
  }

  else ctx.body = {
    success: false,
    message: `Must provide email and password.`,
  }
})

export default router
