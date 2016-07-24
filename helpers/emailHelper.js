import request from 'request'

import { sendInBlueApi, sendInBlueKey } from '../config'

export default function sendEmail(template, to, attr) {
  request({
    url: `${sendInBlueApi}/${template}`,
    method: `PUT`,
    headers: { 'api-key': sendInBlueKey },
    json: true,
    body: { to, attr },
  }, (error) => {
    if (error)
      console.log(error)
  })
}
