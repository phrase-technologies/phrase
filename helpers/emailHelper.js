import request from 'request'

import { clientURL } from '../server.config'
import { sendInBlueApi, sendInBlueKey } from '../config'

function sendEmail(template, to, attr) {
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

export function sendRephraseEmail({ email, authorUsername, username, phraseId }) {
  let newPhraseLink = `${clientURL}/phrase/${username}/${phraseId}`
  sendEmail(4, email, {
    AUTHOR_USERNAME: authorUsername,
    USERNAME: username,
    PHRASE_LINK: newPhraseLink,
  })
}

export function sendPasswordResetEmail({ username, email, resetToken }) {
  let resetLink = `${clientURL}/new-password?token=${resetToken}&email=${email}`
  sendEmail(1, email, { USERNAME: username, RESETLINK: resetLink })
}

export function sendWelcomeEmail({ username, email, confirmToken }) {
  let confirmLink = `${clientURL}/confirm-user?token=${confirmToken}&email=${email}`
  sendEmail(2, email, { USERNAME: username, CONFIRMLINK: confirmLink, CONFIRMTOKEN: confirmToken })
}
