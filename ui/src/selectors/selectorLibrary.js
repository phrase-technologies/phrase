import { createSelector } from 'reselect'

const phrasesSelector    = (state) => (state.library.phrases)
const searchTermSelector = (state) => (state.library.searchTerm)

export const searchResultsSelector = createSelector(
  phrasesSelector,
  searchTermSelector,
  (phrases, searchTerm) => {
    // null => still loading
    if (!phrases)
      return null

    // Filter search results
    return phrases.filter(p => {
      return searchTerm ? (p.phrasename || ``).includes(searchTerm) : true
    })
  }
)
