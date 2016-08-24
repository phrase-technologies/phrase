import fetch from 'isomorphic-fetch'

export default async ({ url, method, headers, body }) => {
  return fetch(url, {
    method: method || `POST`,
    headers: headers || { 'Content-Type': `application/json` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}
