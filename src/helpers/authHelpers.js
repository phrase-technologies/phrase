import 'whatwg-fetch' // `fetch` polyfill for Safari

import { phraseFetch } from 'helpers/ajaxHelpers'

function setUserLocalStorage({ token, user }) {
  localStorage.token = token
  localStorage.userId = user.id
  localStorage.email = user.email
  localStorage.username = user.username
}

export let signup = async ({ body, callback }) => {
  let response = await phraseFetch({
    endpoint: `signup`,
    body,
  })
  let { success, message } = response
  callback({ success, message })
}

export let login = async ({ body, callback }) =>  {
    let response = await phraseFetch({
      endpoint: `api/login`,
      body,
    })
    let { success, message, token, user, passwordFail } = response
    if (success) {
      setUserLocalStorage({ token, user })
      callback({ success, message, user })
    }
    else callback({ message, passwordFail })
}

export let forgotPassword = async (body, callback) => {
  let response = await phraseFetch({
    endpoint: `forgot-password`,
    body,
  })
  let { success, message } = response
  if (success) callback({success, message})
  else callback({ message })
}

export let newPassword = async (body, callback) => {
  let response = await phraseFetch({
    endpoint: `new-password`,
    body,
  })
  let { success, message } = response
  if (success) await login({ body, callback })
  else callback({ message })
}

export let confirmUser = async (body, callback) => {
  let response = await phraseFetch({
    endpoint: `confirm-user`,
    body,
  })
  let { success, token, user, message } = response
  if (success) {
    setUserLocalStorage({ token, user })
    callback({ success, token, user })
  }
  else callback({ message })
}

export let retryConfirmUser = async (body, callback) => {
  let response = await phraseFetch({
    endpoint: `retry-confirm-user`,
    body,
  })
  let { success, message } = response
  if (success) callback({ success })
  else callback({ message })
}

export let oAuthLogin = async ({ body, callback }) => {
  let response = await phraseFetch({
    endpoint: 'oauth-login',
    body,
  })
  let { success, token, user, message } = response
  if (success) {
    setUserLocalStorage({ token, user })
    callback({ success, token, user})
  }
  else callback({ message })
}
