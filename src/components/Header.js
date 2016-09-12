import React from 'react'
import { push } from 'react-router-redux'
import { Link } from 'react-router'
import { phraseNewPhrase } from 'reducers/reducePhrase'
import HeaderSearch from 'components/HeaderSearch.js'
import UserNavigation from 'components/UserNavigation.js'
import { connect } from 'react-redux'
import isSafari from 'helpers/isSafari'

let handleNewPhraseClick = ({
  dispatch,
  existingPhrase,
}) => {
  if (existingPhrase) {
    dispatch(push('/phrase/new'))
  } else if (confirm("Are you sure you want to discard your changes?")) {
    dispatch(phraseNewPhrase())
  }
}

let Header = ({
  dispatch,
  existingPhrase,
  ...props,
}) => {
  if (!props.show) {
    return null
  }

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
          {/* // TEMPORARILY DISABLE UNTIL WE LAUNCH LIBRARY (TODO)
          <HeaderSearch theme={theme} />
          */}
          <div className="btn-group">
            <a
              className={buttonClasses} style={{ paddingLeft: 0 }}
              onClick={() => handleNewPhraseClick({ dispatch, existingPhrase })}
            >
              <span className="fa fa-plus-circle" />
              <span> New</span>
              <span className="hidden-xs"> Phrase</span>
            </a>
          </div>
        </div>
        <Link className="header-logo" to="/" />
        <UserNavigation theme={theme} />
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    existingPhrase: state.phraseMeta.phraseId,
  }
}

export default connect(mapStateToProps)(Header)
