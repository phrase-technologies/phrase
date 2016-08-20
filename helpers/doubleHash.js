import crypto from 'crypto'
import { secret } from '../config'

let hash = password => crypto.createHmac(`sha256`, secret)
  .update(password)
  .digest(`hex`)

export default password => hash(hash(password))
