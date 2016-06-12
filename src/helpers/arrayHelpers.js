import _ from 'lodash'

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
    let result = [...array, element]

    if (typeof sortComparison === 'function')
      result.sort(sortComparison)
    else if (sortComparison)
      result.sort()

    return result
  }
}

export function uReplace(original, replacement) {
  return (array) => {
    let originalPosition = array.indexOf(original)
    let result = [...array]
        result.splice(originalPosition, 1, replacement)
    return result
  }
}

export function uRemove(element) {
  return (array) => {
    let position = array.indexOf(element)
    let result = [...array]
        result.splice(position, 1)
    return result
  }
}


// ----------------------------------------------------------------------------
// Merging Object Key => Arrays (e.g. for Selected Looped Note IDs)
// ----------------------------------------------------------------------------
// When a note is looped, selecting one of the loop iteration selects all of
// the iterations for possible deletion or adjustment, but only the specifically
// targeted iteration for copying to the clipboard. This is necessary because
// copy-pasting from a looped note is most intuitive as a "bouncing"
// functionality rather than one where the looping is maintained.
//
// Example (from arrayHelpers.test.js):
//
// let a = {
//   0: [0],
//   1: [3, 4],
//   2: [0],
//   3: [0, 1],
// }
//
// let b = {
//   0: [0],
//   1: [4, 5],
//   4: [10],
// }
//
// let result = {
//   1: [3, 5],
//   2: [0],
//   3: [0, 1],
//   4: [10],
// }
//
// Since we're in redux, we need to do this immutably, so a completely new
// object is returned.

export const objectMergeKeyArrays = (a, b, { xor = true } = { xor: true }) => {
  let initial = Object.keys(a).reduce((acc, key) => ({ // discard dupe keys
    ...acc,
    ...(b[key] ? {} : { [key]: a[key] })
  }), {})

  return Object.keys(b).reduce((result, key) => {
    let merged, existingEntry = a[key]
    // Handle case where same key is present in both
    if (existingEntry) {
      // XOR/union merge
      merged = xor
        ? _.xor(existingEntry, b[key])
        : _.union(existingEntry, b[key])

      // Remove if result is empty
      merged = merged.length ? { [key]: merged } : {}
    }

    return {
      ...result,
      ...(existingEntry ? merged : { [key] : b[key] })
    }
  }, initial)
}


// ----------------------------------------------------------------------------
// Select/Memoize many, many Key-Value pairs
// ----------------------------------------------------------------------------
// By default, createSelector from 'reselect' only caches the most recent
// call. Here we create a new version called "createLargeCacheSelector" which
// will cache every single permutation of arguments it gets!
//
// This may get unwieldy when Phrases get large... TODO!
import { createSelectorCreator } from 'reselect'
import { memoize } from 'lodash'

const hashFn = (...args) => {
  return args.reduce((hashKey, arg) => {
    return hashKey + '-' + JSON.stringify(arg)
  }, '')
}
export const createLargeCacheSelector = createSelectorCreator(memoize, hashFn)
