export const namespaceActions = (namespace, constants) => {
  return Object.freeze(
    constants.reduce((obj, constant) => {
      return {
        ...obj,
        [constant]: `${namespace}/${constant}`
      }
    }, {})
  )
}
