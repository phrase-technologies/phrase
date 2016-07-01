import React from 'react'
import { phraseNewPhrase } from 'reducers/reducePhrase'
import HeaderSearch from 'components/HeaderSearch.js'
import UserNavigation from 'components/UserNavigation.js'
import { connect } from 'react-redux'
import isSafari from 'helpers/isSafari'

let handleNewPhraseClick = ({
  dispatch,
  params,
  phrase,
}) => {
  let loggedIn = localStorage.userId
  let existingPhrase = params.phraseId
  let unsavedChanges = phrase.past.length || phrase.future.length
  let resetWarning = "Are you sure you want to discard your unsaved phrase, bro?"

  if (loggedIn || existingPhrase || !unsavedChanges || confirm(resetWarning)) {
    dispatch(phraseNewPhrase())
  }
}

let Header = ({
  dispatch,
  phrase,
  params,
  ...props,
}) => {
  let theme = 'solid' || props.theme
  let headerClasses = "header"
      headerClasses += (theme === 'solid') ? ' header-solid' : ''
  let containerClasses = "container"
      containerClasses += (props.maximize) ? " container-maximize" : ''
      containerClasses += isSafari() ? ' container-safari-fix' : ''
  let buttonClasses = "btn btn-link link-dark"
      buttonClasses += (theme === 'solid') ? ' link-bright' : ''

  return (
    <div className={headerClasses}>
      <div className={containerClasses}>
        <div className="btn-toolbar pull-left">
          <HeaderSearch theme={theme} />
          <div className="btn-group">
            <a
              className={buttonClasses}
              onClick={() => handleNewPhraseClick({ dispatch, params, phrase })}
            >
              <span className="fa fa-plus-circle" />
              <span> New Phrase</span>
            </a>
          </div>
        </div>
        <div className="header-logo" />
        <UserNavigation theme={theme} />
      </div>
    </div>
  )
}

export default connect(state => ({ phrase: state.phrase }))(Header)
