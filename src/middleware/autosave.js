import _ from 'lodash'
import { phrase, library } from 'actions/actions'
import { librarySave } from 'reducers/reduceLibrary'
import { api } from 'helpers/ajaxHelpers'

let autosave = store => next => action => {

  let oldState = store.getState()
  let result = next(action)
  let newState = store.getState()

  // Only update if an existing phrase has changed
  if (
    localStorage.userId &&
    localStorage.userId !== 'undefined' &&
    action.type !== phrase.LOAD &&
    hasPhraseChanged({ oldState, newState })
    ) {
    api({
      endpoint: `update`,
      body: {
        phraseId: newState.phraseMeta.phraseId,
        phraseName: newState.phraseMeta.phraseName,
        phraseState: newState.phrase,
      },
    })
  }

  //TODO: look into refactoring using `meta` key

  // If you're logged in and make an edit to a new phrase, save it right away
  if (
    action.type !== library.SAVE &&
    action.type !== phrase.NEW_PHRASE &&
    localStorage.userId &&
    localStorage.userId !== `undefined` &&
    !newState.phraseMeta.phraseId &&
    newState.phrase.past.length > oldState.phrase.past.length
  ) {
    if (action.meta !== `autosaveIgnore`) store.dispatch(librarySave())
  }

  return result

}

export default autosave

// Detect if there is actually something to update.
export function hasPhraseChanged({ oldState, newState }) {
  let oldId = oldState.phraseMeta.phraseId
  let oldName = oldState.phraseMeta.phraseName
  let newId = newState.phraseMeta.phraseId
  let newName = newState.phraseMeta.phraseName

  let idUnchanged = newId === oldId // Ignore if we are just switching phrases
  let nameChanged = newName !== oldName // Pick up on name changes (broken out into phraseMeta branch)
  let stateChanged = newState.phrase.present !== oldState.phrase.present // Has the data actually changed?
  let fromHistory // Ignore traversal through history
    =  newState.phrase.present ===  _.last(oldState.phrase.past)
    || newState.phrase.present === _.first(oldState.phrase.future)

  return newId && idUnchanged && ((stateChanged && !fromHistory) || nameChanged)
}
