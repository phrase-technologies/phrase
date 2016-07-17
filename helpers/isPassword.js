// Length at least six
export default (password) => {
  return /^(.{6,})$/.test(password)
}
