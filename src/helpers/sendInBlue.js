
import path from 'path'
import fetch from 'node-fetch'
import { EmailTemplate } from 'email-templates'

import { sendInBlueApi, sendInBlueKey } from '../config'

export let sendInBlueApiRequest = async ({ endpoint, method, body }) => {
  if (process.env.NODE_ENV === `test`) {
    return
  }
  let response = await fetch(`${sendInBlueApi}/${endpoint}`, {
    method,
    headers: {
      'Content-Type': `application/json`,
      'api-key': sendInBlueKey,
    },
    body: JSON.stringify(body),
  })
  return response
}

export let createEmailContact = ({ email, username, userId }) => {
  return sendInBlueApiRequest({
    endpoint: `/user/createdituser`,
    method: `POST`,
    body: {
      email,
      attributes: {
        USERNAME: username,
        USER_ID: userId,
      },
    },
  })
}

export let addToMicrophoneLineInList = ({ email }) => {
  return sendInBlueApiRequest({
    endpoint: `list/4/users`,
    method: `POST`,
    body: {
      users: [ email ],
    },
  })
}

export let sendHtmlEmail = async ({ email, subject, template, data, files }) => {
  let emailTemplate = new EmailTemplate(path.resolve(`templates`, template))
  let render = await new Promise((resolve, reject) => {
    emailTemplate.render(data, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
  let body = {
    to: { [email]: email },
    from: [ `do-not-reply@phrase.fm`, `Phrase Technologies` ],
    subject,
    html: render.html,
  }
  if (files && files.length) {
    body.attachment = files
  }
  return sendInBlueApiRequest({
    endpoint: `email`,
    method: `POST`,
    body,
  })
}
