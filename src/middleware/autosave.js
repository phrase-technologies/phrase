import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave, phrasePristine } from 'reducers/reducePhrase'
import { phrase } from 'actions/actions'

let changesDuringPlayback = false

let autosave = store => next => action => {

  let oldState = store.getState()
  let result = next(action)

  // Bail early where required
  if (action.ignoreAutosave) return result
  let actionNamespace = action.type.split(`/`)[0]
  switch (actionNamespace) { // Action namespaces that would never affect phrase state
    case `pianoroll`:
    case `mixer`:
    case `cursor`:
    // case `transport`: // Need transport stop actions to pass through here to trigger save upon completion of playback
    case `mouse`:
      return result
    default:
      break
  }

  let newState = store.getState()

  let existingPhrase = newState.phraseMeta.phraseId
  let loggedIn = localStorage.userId && localStorage.userId !== 'undefined'
  let writePermission = newState.phraseMeta.masterControl.includes(localStorage.userId)

  // Phrase Changes?
  if (hasPhraseBeenModified({ oldState, newState })) {

    // Mark as dirty
    store.dispatch(phrasePristine({ pristine: false }))


    // Only save if this is an existing phrase that has been modified
    if (existingPhrase && loggedIn && writePermission) {
      // Don't save during playback - interruptions are ugly. Queue it up!
      if (newState.transport.playing) {
        changesDuringPlayback = true
      } else {
        store.dispatch(phraseSave())
      }
    }

    // View-only permissions - warn user changes are not saved!
    else if (existingPhrase && !writePermission) {
      store.dispatch({ type: phrase.REPHRASE_REMINDER, payload: { show: true } })
    }

    // If you're logged in and make an edit to a new phrase, save it right away
    else if (!existingPhrase && loggedIn) {
      if (newState.transport.playing || newState.phraseMeta.saving)
        changesDuringPlayback = true
      else
        store.dispatch(librarySaveNew())
    }
  }

  // Save changes that were queued up during playback, or queued up while a new phrase was saving
  else if(!newState.phraseMeta.saving && !newState.transport.playing && changesDuringPlayback) {
    changesDuringPlayback = false
    if (existingPhrase)
      store.dispatch(phraseSave())
    else
      store.dispatch(librarySaveNew())
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
