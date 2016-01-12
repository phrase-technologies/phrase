// ----------------------------------------------------------------------------
// Immutable Array Manipulation Helpers
// ----------------------------------------------------------------------------
// Frameworks like React and Redux depend on immutable data to be performant.
// Thus we use helper libraries like immutable-js, seamless-immutable,
// and updeep. The following customizations work in conjunction with updeep
// to return modified states without mutating any previous state object(s).

export function uIncrement(increment) {
  return (value) => {
    return value + increment
  }
}

export function uAppend(element, sortComparison = undefined) {
  return (array) => {
    var result = [...array, element]

    if (typeof sortComparison === "function")
      result.sort(sortComparison)
    else if (sortComparison)
      result.sort()

    return result
  }
}

export function uReplace(original, replacement) {
  return (array) => {
    var originalPosition = array.indexOf(original)
    var result = [...array]
        result.splice(originalPosition, 1, replacement)
    return result
  }
}

