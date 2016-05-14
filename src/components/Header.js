import React from 'react'
import HeaderSearch from 'components/HeaderSearch.js'
import UserNavigation from 'components/UserNavigation.js'
import { connect } from 'react-redux'

let handleNewPhraseClick = (dispatch, params) => {
  if (params.phraseId) {

  }
}

let Header = ({ dispatch, ...props }) => {
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
              onClick={() => handleNewPhraseClick(dispatch, props.params)}
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

export default connect()(Header)
