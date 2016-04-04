import Koa from 'koa'
import convert from 'koa-convert'
import bodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'
import { db } from './config'
import auth from './auth'


mongoose.connect(db)

let app = new Koa()

app.use(convert(bodyParser()))
app.use(auth.routes())

app.keys = [ `i got 99 problemz but a DAW aint one` ]

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`)
})

export default app
