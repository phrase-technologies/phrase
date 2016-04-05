import Router from 'koa-router'
import jwt from 'koa-jwt'
import User from '../models/User'
import { secret } from '../config'

let router = new Router({ prefix: `/api` })

router.post(`/signup`, async ctx => {

  let { email, password } = ctx.request.body

  if (email && password) {
    let user = await User.findOne({ email })

    if (user) {
      ctx.body = {
        success: false,
        message: `User with this email already exists.`,
      }
    }

    else {

      /*
       *  TODO: hash password
       */

      let user = new User({ email, password })
      let response = await user.save()
      ctx.body = { success: true, user: response }
    }
  }

  else ctx.body = {
    success: false,
    message: `Must provide email and password.`,
  }
})

router.post(`/authenticate`, async ctx => {

  let { email, password } = ctx.request.body

  let user = await User.findOne({ email })

  if (!user) {
    ctx.body = { success: false, message: `User not found.` }
  }

  else if (user) {

    if (user.password !== password) {
      ctx.body = { success: false, message: `Wrong password.` }
    }

    else {

      let token = jwt.sign(user, secret, {
        expiresInMinutes: 1440, // expires in 24 hours
      })

      ctx.body = {
        success: true,
        message: `Enjoy your token!`,
        token,
        user,
      }
    }
  }
})

export default router
