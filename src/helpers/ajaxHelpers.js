/* global JSON, localStorage */

import 'whatwg-fetch' // `fetch` polyfill for Safari

export let phraseFetch = async({ endpoint, body }) => {
  let response
  try {
    response = await fetch(`${API_URL}/${endpoint}`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw { status: 504, statusText: "Connection failure" } // Request failed / Timeout
  }
  if (response.ok) return response.json()
  throw response
}

export let api = async ({ endpoint, body }) => {
  let response = await phraseFetch({
    endpoint: `api/${endpoint}`,
    body: {
      token: localStorage.token,
      email: localStorage.email,
      username: localStorage.username,
      userId: localStorage.userId,
      ...(body || {})
    },
  })
  return response
}
