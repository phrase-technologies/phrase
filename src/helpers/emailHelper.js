import request from 'request'
import { clientURL, sendInBlueApi, sendInBlueKey } from '../config'

let sendInBlueApiRequest = ({ endpoint, method, body }) => {
  if (process.env.NODE_ENV === `test`) {
    return
  }

  return request({
    url: `${sendInBlueApi}/${endpoint}`,
    method,
    headers: { 'api-key': sendInBlueKey },
    json: true,
    body,
  }, (error) => {
    if (error) console.log(error)
  })
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

let sendEmail = (template, to, attr) => {
  return sendInBlueApiRequest({
    endpoint: `template/${template}`,
    method: `PUT`,
    body: { to, attr },
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

export let sendRephraseEmail = ({ email, authorUsername, username, phraseId }) => {
  let newPhraseLink = `${clientURL}/phrase/${username}/${phraseId}`
  return sendEmail(4, email, {
    AUTHOR_USERNAME: authorUsername,
    USERNAME: username,
    PHRASE_LINK: newPhraseLink,
  })
}

export let sendPasswordResetEmail = ({ username, email, resetToken }) => {
  let resetLink = `${clientURL}/new-password?token=${resetToken}&email=${email}`
  return sendEmail(1, email, { USERNAME: username, RESETLINK: resetLink })
}

export let sendWelcomeEmail = ({ email, username, confirmToken }) => {
  let confirmLink = `${clientURL}/confirm-user?token=${confirmToken}&email=${email}`
  return sendEmail(2, email, {
    USERNAME: username,
    CONFIRMLINK: confirmLink,
    CONFIRMTOKEN: confirmToken,
  })
}
