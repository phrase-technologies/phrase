
export let formatLoadedUser = ({ loadedUser }) => {
  if (!loadedUser) return null
  let { id, email, username, dateCreated, picture } = loadedUser
  return { id, email, username, dateCreated, picture }
}
