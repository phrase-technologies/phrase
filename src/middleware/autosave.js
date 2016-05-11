import { api } from 'helpers/ajaxHelpers'

let autosave = store => next => action => {

  if (action.type.includes(`phrase/`) && localStorage.username) {

    let state = store.getState()
    let phraseId = location.pathname.split(`/`)[3]

    api({
      endpoint: `update`,
      body: {
        phraseState: state.phrase,
        phraseId
      },
    })
  }

  return next(action)

}

export default autosave
