import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import { libraryLoadAll } from 'reducers/reduceLibrary'
import { searchResultsSelector } from 'selectors/selectorLibrary'
import LibraryPhrases from 'components/LibraryPhrases'

export class Library extends Component {

  componentDidMount() {
    let { dispatch } = this.props
    dispatch(libraryLoadAll())
  }

  render() {
    let { phrases, searchTerm } = this.props
    let selectionTitle = searchTerm ? (<em>"{searchTerm}"</em>) : "All Phrases"

    return (
      <div className="library">
        <Helmet title={`${this.props.searchTerm || "Browser Phrases"} - Phrase.fm`} />
        <div className="library-header page-header">
          <div className="container">
            <h1>
              <a>Home</a>
              &nbsp;
              <span className="fa fa-fw fa-caret-right" />
              { selectionTitle }
            </h1>
          </div>
        </div>
        <LibraryPhrases phrases={phrases} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    phrases: searchResultsSelector(state),
    searchTerm: state.library.searchTerm,
  }
}

export default connect(mapStateToProps)(Library)
