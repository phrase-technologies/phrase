import { phrase } from 'actions/actions'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSaveStart, phraseSaveFinish } from 'reducers/reducePhrase'
import { api } from 'helpers/ajaxHelpers'

let autosave = store => next => action => {

  let oldState = store.getState()
  let result = next(action)
  let newState = store.getState()

  // Autosaving requires being logged in
  if (!localStorage.userId || localStorage.userId === 'undefined')
    return result

  // Only update if an existing phrase has been modified
  if (hasPhraseBeenModified({ action, oldState, newState })) {
    store.dispatch(phraseSaveStart())
    api({
      endpoint: `update`,
      body: {
        phraseId: newState.phraseMeta.phraseId,
        phraseName: newState.phraseMeta.phraseName,
        phraseState: newState.phrase,
      },
    }).then(() => {
      store.dispatch(phraseSaveFinish())
    })
  }

  // If you're logged in and make an edit to a new phrase, save it right away
  else if (isFirstEditToNewPhrase({ oldState, newState })) {
    store.dispatch(librarySaveNew())
  }

  return result

}

export default autosave



// ============================================================================
// Autosave Helper Methods
// ============================================================================

// Detect if there is actually something to update.
export function hasPhraseBeenModified({ action, oldState, newState }) {
  // Ignore phrase loads (that look like edits)
  if (action.type === phrase.LOAD_FINISH)
    return false

  let oldId = oldState.phraseMeta.phraseId
  let oldName = oldState.phraseMeta.phraseName
  let newId = newState.phraseMeta.phraseId
  let newName = newState.phraseMeta.phraseName

  let idUnchanged = newId === oldId // Ignore if we are just switching phrases
  let nameChanged = newName !== oldName // Pick up on name changes (broken out into phraseMeta branch)
  let stateChanged = newState.phrase !== oldState.phrase // Has the phrase actually changed?

  return newId && idUnchanged && (stateChanged || nameChanged)
}

// Detect if a blank phrase has been modified (and ready to generate a unique phrase ID)
export function isFirstEditToNewPhrase({ oldState, newState }) {
  return (
    !oldState.phraseMeta.loading &&
    !newState.phraseMeta.loading &&
    !newState.phraseMeta.phraseId &&
    (
      newState.phrase !== oldState.phrase ||
      newState.phraseMeta.phraseName
    )
  )
}
