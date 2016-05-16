/* global JSON, localStorage */

import { serverUrl } from 'config'

export let api = async ({ endpoint, body }) => {
  let response = await fetch(`${serverUrl}/api/${endpoint}`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      token: localStorage.token,
      email: localStorage.email,
      username: localStorage.username,
      userId: localStorage.userId,
      ...(body || {})
    }),
  })

  return response.json()
}
