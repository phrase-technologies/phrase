import request from 'request'
import { sendinblueapi, sendinbluekey } from '../config'

export default function sendEmail(template, to, attr) {
  request({
    url: `${sendinblueapi}/${template}`,
    method: `PUT`,
    headers: { 'api-key': sendinbluekey },
    json: true,
    body: { to, attr },
  }, (error) => {
    if (error)
      console.log(error)
  })
}
