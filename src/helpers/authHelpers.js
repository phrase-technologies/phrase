import { serverUrl } from 'config'

export let signup = async (body, callback) => {
  let response = await fetch(`${serverUrl}/signup`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  let { success, message } = await response.json()
  if (success) login(body, callback)
  else callback({ success, message })
}

export let login = async (body, callback) =>  {
  let response = await fetch(`${serverUrl}/api/login`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  let { success, message, token, user } = await response.json()

  if (success) {
    localStorage.token = token
    localStorage.userId = user.id
    localStorage.email = user.email
    localStorage.username = user.username
    callback({ success, message, user })
  }
  else callback({ message })
}
