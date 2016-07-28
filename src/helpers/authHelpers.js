import 'whatwg-fetch' // `fetch` polyfill for Safari

export let signup = async ({ body, callback, failCallback }) => {
  try {
    let response = await fetch(`${API_URL}/signup`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(body),
    })

    if (!response.ok) failCallback()
    else {
      let { success, message } = await response.json()
      if (success) login({ body, callback, failCallback })
      else callback({ success, message })
    }
  }
  catch (e) {
    failCallback()
  }
}

export let login = async ({ body, callback, failCallback }) =>  {
  try {
    let response = await fetch(`${API_URL}/api/login`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(body),
    })
    if (!response.ok) failCallback()
    else {
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
  }
  catch (e) {
    failCallback()
  }
}
