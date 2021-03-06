/* global JSON, localStorage */

import 'whatwg-fetch' // `fetch` polyfill for Safari

import { addNotification } from 'reducers/reduceNotification'

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

export let xhrApi = async ({ endpoint, body, onProgress, onLoad, timeout, dispatch }) => {
  let fd = new FormData()
  await Object.keys(body).forEach(key => {
    fd.append(key, body[key])
  })
  fd.append(`token`, localStorage.token)
  fd.append(`email`, localStorage.email)
  fd.append(`username`, localStorage.username)
  fd.append(`userId`, localStorage.userId)

  let req = new XMLHttpRequest()
  if (onProgress)
    req.upload.onprogress = onProgress
  req.timeout = timeout ? timeout : 5000
  req.ontimeout = () => {
    dispatch(addNotification({
      title: `504`,
      message: `Connection Failure`
    }))
    if (onLoad)
      onLoad()
  }
  req.onload = async () => {
    let json
    if (req.status !== 200)
      dispatch(addNotification({
        title: req.status.toString(),
        message: req.statusText
      }))
    else
      json = await JSON.parse(req.responseText)
    if (onLoad)
      onLoad(json)
  }
  req.open(`post`, `${API_URL}/api/${endpoint}`)
  req.send(fd)
}
