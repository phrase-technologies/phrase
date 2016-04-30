/* global JSON, localStorage */

export let protocol = `http`
export let domain = `localhost:5000`
export let serverUrl = `${protocol}://${domain}`

export let api = async ({ endpoint, body }) => {
  let response = await fetch(`${serverUrl}/api/${endpoint}`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      token: localStorage.token,
      email: localStorage.email,
      username: localStorage.username,
      _id: localStorage.userId,
      ...(body || {})
    }),
  })

  return response.json()
}
