import { clientURL } from '../config'

export let getOAuthCallbackURL = (user) => {
  let redirectUrl = `http://${clientURL}/oauth-callback?`
  if (!user)
    redirectUrl += `error=true`
  else {
    Object.keys(user).forEach(key => {
      redirectUrl += `${key}=${user[key]}&`
    })
    redirectUrl = redirectUrl.slice(0, -1)
  }
  return redirectUrl
}
