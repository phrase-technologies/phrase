// Numbers, Letters, and Underscores only
export default (username) => {
  return /^([A-Za-z0-9\_]{3,})$/.test(username)
}
