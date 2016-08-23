import fetch from 'isomorphic-fetch'

export default async ({ url, method, headers, body }) => {
  let response = await fetch(url, {
    method: method || `POST`,
    headers: headers || { 'Content-Type': `application/json` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  let data = await response.json()
  return data
}
