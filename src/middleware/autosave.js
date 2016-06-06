import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave, phrasePristine } from 'reducers/reducePhrase'

let autosave = store => next => action => {

  let oldState = store.getState()
  let result = next(action)
  let newState = store.getState()

  // Phrase Changes?
  if (hasPhraseBeenModified({ oldState, newState })) {

    // Mark as dirty
    store.dispatch(phrasePristine({ pristine: false }))

    let existingPhrase = newState.phraseMeta.phraseId
    let loggedIn = localStorage.userId && localStorage.userId !== 'undefined'
    let writePermission = localStorage.username === newState.phraseMeta.authorUsername

    // Only update if an existing phrase has been modified
    if (existingPhrase && loggedIn && writePermission) {
      store.dispatch(phraseSave())
    }

    // If you're logged in and make an edit to a new phrase, save it right away
    else if (!existingPhrase && loggedIn) {
      store.dispatch(librarySaveNew())
    }
  }

  return result

}

export default autosave



// ============================================================================
// Autosave Helper Methods
// ============================================================================

// Detect if there is actually something to update.
export function hasPhraseBeenModified({ oldState, newState }) {
  // Ignore phrase loads (that look like edits)
  if (oldState.phraseMeta.loading || newState.phraseMeta.loading)
    return false

  let idUnchanged = newState.phraseMeta.phraseId === oldState.phraseMeta.phraseId // Ignore if we are just switching phrases
  let nameChanged = newState.phraseMeta.phraseName !== oldState.phraseMeta.phraseName // Pick up on name changes (broken out into phraseMeta branch)
  let stateChanged = newState.phrase !== oldState.phrase // Has the phrase actually changed?

  return idUnchanged && (stateChanged || nameChanged)
}