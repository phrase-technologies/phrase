import 'whatwg-fetch' // `fetch` polyfill for Safari

export let signup = async ({ body, callback }) => {
  let response = await fetch(`${API_URL}/signup`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    let { success, message } = await response.json()
    if (success) await login({ body, callback })
    else callback({ success, message })
  }
  else throw response.error
}

export let login = async ({ body, callback }) =>  {
    let response = await fetch(`${API_URL}/api/login`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(body),
    })
    if (response.ok)  {
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
    else throw response.error
}
