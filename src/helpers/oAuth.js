import { clientURL } from '../config'

export let getOAuthCallbackURL = (user) => {
  let redirectUrl = Object.keys(user).reduce((obj, key) => {
    return obj += `${key}=${user[key]}&`
  }, `http://${clientURL}/oauth-callback?`)
  return redirectUrl.slice(0, -1)
}
