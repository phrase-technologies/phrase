import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave, phrasePristine } from 'reducers/reducePhrase'

let changesDuringPlayback = false

let autosave = store => next => action => {

  let oldState = store.getState()
  let result = next(action)

  // bail early on action namespaces we don't care about:
  let actionNamespace = action.type.split(`/`)[0]

  if (action.ignoreAutosave) return result

  switch (actionNamespace) {
    case `pianoroll`:
    case `mixer`:
    case `cursor`:
    case `transport`:
    case `mouse`:
      return result
    default:
      break
  }

  let newState = store.getState()

  // Phrase Changes?
  if (hasPhraseBeenModified({ oldState, newState })) {

    // Mark as dirty
    store.dispatch(phrasePristine({ pristine: false }))

    let existingPhrase = newState.phraseMeta.phraseId
    let loggedIn = localStorage.userId && localStorage.userId !== 'undefined'
    let writePermission = localStorage.username === newState.phraseMeta.authorUsername

    // Only save if this is an existing phrase that has been modified
    if (existingPhrase && loggedIn && writePermission) {
      // Don't save during playback - interruptions are ugly. Queue it up!
      if (newState.transport.playing) {
        changesDuringPlayback = true
      } else {
        store.dispatch(phraseSave())
      }
    }

    // If you're logged in and make an edit to a new phrase, save it right away
    else if (!existingPhrase && loggedIn) {
      if (newState.phraseMeta.saving)
        changesDuringPlayback = true
      else
        store.dispatch(librarySaveNew())
    }
  }

  // Save changes that were queued up during playback, or queued up while a new phrase was saving
  else if(!newState.phraseMeta.saving && !newState.transport.playing && changesDuringPlayback) {
    changesDuringPlayback = false
    store.dispatch(phraseSave())
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
