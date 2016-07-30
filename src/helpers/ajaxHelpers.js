/* global JSON, localStorage */

import 'whatwg-fetch' // `fetch` polyfill for Safari

export let api = async ({ endpoint, body }) => {
    let response = await fetch(`${API_URL}/api/${endpoint}`, {
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

    if (response.ok) return response.json()
    throw response.error
}
