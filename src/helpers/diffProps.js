// ----------------------------------------------------------------------------
// diffProps()
// ----------------------------------------------------------------------------
// In React, it's very common to have only specific props dictate
// whether or not the component needs to be re-rendered.
export default (nextProps, prevProps, specificPropsToDiff) => {
  let changeDetected = specificPropsToDiff.some(prop => {
    return nextProps[prop] !== prevProps[prop]
  })
  return changeDetected
}
