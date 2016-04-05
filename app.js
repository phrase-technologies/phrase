import Koa from 'koa'
import convert from 'koa-convert'
import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors';
import mongoose from 'mongoose'
import { db } from './config'
import auth from './auth'
import jwt from 'koa-jwt'
import { secret } from './config'
import chalk from 'chalk'

mongoose.connect(db)

let app = new Koa()

app.keys = [ `i got 99 problemz but a DAW aint one` ]

app.use(convert(cors()))
app.use(convert(bodyParser()))
app.use(auth.routes())
app.use(convert(jwt({ secret })))

app.listen(5000, () => {
  console.log(chalk.yellow(`⚡ Server running at http://localhost:5000`))
})

export default app
