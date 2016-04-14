// Numbers, Letters, and Underscores only
export default (username) => {
  return /^([A-Za-z0-9\_]+)$/.test(username)
}
