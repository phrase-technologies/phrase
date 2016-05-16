import React from 'react'
import { push } from 'react-router-redux'
import { phraseNewPhrase } from 'reducers/reducePhrase'
import HeaderSearch from 'components/HeaderSearch.js'
import UserNavigation from 'components/UserNavigation.js'
import { connect } from 'react-redux'

let handleNewPhraseClick = ({
  dispatch,
  params,
  phrase,
}) => {

  // If not logged in:

  if (!localStorage.userId) {

    // If on existing phrase

    if (params.phraseId) {
      dispatch(phraseNewPhrase())
      dispatch(push(`/phrase/new`))
      localStorage.removeItem('reduxPersist:phrase')
      localStorage.removeItem('reduxPersist:phraseMeta')
    }

    else {
      if (phrase.past.length) alert(`you're gonna lose your stuff bro, login first!`)
      else {
        dispatch(phraseNewPhrase())
        dispatch(push(`/phrase/new`))
      }
    }
  }

  // logged in:

  else {
    dispatch(phraseNewPhrase())
    dispatch(push(`/phrase/new`))
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
  let buttonClasses = "btn btn-link"
      buttonClasses += (theme === 'solid') ? ' link-dark' : ''

  return (
    <div className={headerClasses}>
      <div className="container">
        <div className="btn-toolbar pull-left">
          <HeaderSearch theme={theme} />
          <div className="btn-group">
            <a
              className={buttonClasses}
              onClick={() => handleNewPhraseClick({ dispatch, params, phrase })}
            >
              <span>+ </span>
              <span className="fa fa-file" />
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
