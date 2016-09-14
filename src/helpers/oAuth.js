import { clientURL } from '../config'

let getOAuthCallbackURL = (user) => {
  let redirectUrl = Object.keys(user).reduce((obj, key) => {
    return obj += `${key}=${user[key]}&`
  }, `http://${clientURL}/oauth-callback?`)
  return redirectUrl.slice(0, -1)
}

export let oAuthRedirect = (res, err, user) => {
  if (!user) {
    console.log(err)
    res.redirect(getOAuthCallbackURL({ error: true }))
  }
  else {
    res.redirect(getOAuthCallbackURL(user))
  }
}
