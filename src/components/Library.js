import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import Helmet from "react-helmet"
import Moment from 'moment'

import { searchResultsSelector } from 'selectors/selectorLibrary.js'
import PhraseCard from 'components/PhraseCard.js'

export class Library extends Component {

  render() {
    let { phrases, searchTerm } = this.props
    let selectionTitle = searchTerm ? (<em>"{searchTerm}"</em>) : "All Phrases"

    return (
      <div className="library">
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
        <div className="library-body">
          <div className="container library-body-container">

            <div className="library-selection-pane">
              <ul className="stories" tabIndex={0} ref={ref => this.selectionPane = ref}>
                { this.renderSelectionPaneResults({ phrases }) }
              </ul>
            </div>

            <div className="library-preview-pane">
              { this.renderPreview() }
            </div>

          </div>
        </div>
      </div>
    )
  }

  renderSelectionPaneResults({ phrases }) {
    if (!phrases)
      return (
        <div className="library-selection-pane-end">
          Loading...
        </div>
      )

    if (!phrases.length)
      return (
        <div className="library-selection-pane-end">
          No phrases found.
        </div>
      )

    return phrases.map((phrase) => (
      <PhraseCard
        phrase={phrase}
        plays={125}
        likes={2}
        comments={1}
        key={phrase.id}
      />
    )).concat(
      <div className="library-selection-pane-end text-center" key="end">
        <span className="fa fa-anchor" style={{ color: '#CCC' }} />
      </div>
    )
  }

  renderPreview() {
    // Nothing selected for preview
    if (!this.props.phraseId) {
      return (
        <div className="library-preview-explanation">
          <h2>Choose a phrase on the left</h2>
          <p>
            Press
            <small style={{ fontSize: 10, padding: 2 }}>
              <span className="fa-stack fa-lg">
                <i className="fa fa-square-o fa-stack-2x"></i>
                <i className="fa fa-arrow-up fa-stack-1x"></i>
              </span>
            </small>
            or
            <small style={{ fontSize: 10, padding: 2 }}>
              <span className="fa-stack fa-lg">
                <i className="fa fa-square-o fa-stack-2x"></i>
                <i className="fa fa-arrow-down fa-stack-1x"></i>
              </span>
            </small>
            to cycle through them quickly
          </p>
        </div>
      )
    }

    // Preview Phrase
    let { dispatch, phraseId, authorUsername } = this.props
    let timestamp = Moment(this.props.dateCreated).fromNow()

    return (
      <div className="library-preview-phrase">
        <h1 className="library-preview-phrase-title">
          { this.props.phraseName || (<em>"Untitled Phrase"</em>) }
        </h1>
        <h2 className="library-preview-phrase-author">
          by {this.props.authorUsername}
        </h2>
        <div className="library-preview-transport">
          <div className="btn-group">
            <button className="btn btn-link" onClick={this.handleClickPrev}>
              <span className="fa fa-fw fa-2x fa-backward" />
            </button>
            <button className="btn btn-link">
              <span className="fa fa-fw fa-2x fa-play" />
            </button>
            <button className="btn btn-link" onClick={this.handleClickNext}>
              <span className="fa fa-fw fa-2x fa-forward" />
            </button>
          </div>
        </div>
        <div className="library-preview-actions">
          <div className="btn-group" style={{ marginRight: 5 }}>
            <button className="btn btn-bright" onClick={() => dispatch(push(`/phrase/${authorUsername}/${phraseId}`))}>
              <span className="fa fa-external-link" />
              <span> Open</span>
            </button>
          </div>
          <div className="btn-group" onClick={() => alert("TODO")}>
            <button className="btn btn-dark">
              <span className="fa fa-code-fork" />
              <span> Rephrase</span>
            </button>
          </div>
        </div>
        <div className="library-preview-timestamp">
          {"Created " + timestamp.toString()}
        </div>
      </div>
    )
  }

  handleClickPrev() {
    alert("Prev TODO!")
  }

  handleClickNext() {
    alert("Next TODO!")
    /*
    dispatch(phraseLoadFromMemory({
      id: phrase.id,
      name: phrase.phrasename,
      username: phrase.username,
      dateCreated: phrase.saved_date,
      state: phrase.state,
    }))
    */
  }

}

function mapStateToProps(state) {
  return {
    phrases: searchResultsSelector(state),
    searchTerm: state.library.searchTerm,
    phraseId: state.phraseMeta.phraseId,
    phraseName: state.phraseMeta.phraseName,
    authorUsername: state.phraseMeta.authorUsername,
    dateCreated: state.phraseMeta.dateCreated,
  }
}

export default connect(mapStateToProps)(Library)
