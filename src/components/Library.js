import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { libraryLoadAll } from 'reducers/reduceLibrary'
import { phraseLoadFromMemory, phraseRephrase } from 'reducers/reducePhrase'
import { transportPlayToggle } from '../reducers/reduceTransport.js'

import Helmet from "react-helmet"
import Moment from 'moment'

import { searchResultsSelector } from 'selectors/selectorLibrary.js'
import PhraseCard from 'components/PhraseCard.js'

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

    return phrases.map((phrase) => {
      let active = phrase.id === this.props.phraseId
      return (
        <PhraseCard
          phrase={phrase}
          active={active}
          plays={125}
          likes={2}
          comments={1}
          key={phrase.id}
        />
      )
    }).concat(
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
    let dateCreated = Moment(this.props.dateCreated).fromNow().toString()
    let dateModified = Moment(this.props.dateModified).fromNow().toString()
    let playIconClasses = "fa fa-fw fa-2x "
        playIconClasses += this.props.playing ? " fa-pause" : " fa-play"

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
            <button className="btn btn-link" onClick={this.handleTogglePlay}>
              <span className={playIconClasses} />
            </button>
            <button className="btn btn-link" onClick={this.handleClickNext}>
              <span className="fa fa-fw fa-2x fa-forward" />
            </button>
          </div>
        </div>
        <div className="library-preview-actions">
          <div className="btn-group" style={{ marginRight: 5 }}>
            <button className="btn btn-bright btn-lg" onClick={() => dispatch(push(`/phrase/${authorUsername}/${phraseId}`))}>
              <span className="fa fa-eye" />
              <span> View Phrase</span>
            </button>
          </div>
          <div className="btn-group" onClick={() => dispatch(phraseRephrase())}>
            <button className="btn btn-primary btn-lg">
              <span className="fa fa-pencil-square-o" />
              <span> Rephrase</span>
            </button>
          </div>
        </div>
        <div className="library-preview-timestamp">
          {"Last changed " + dateModified}
          <br/>
          {"Created " + dateCreated}
        </div>
      </div>
    )
  }

  handleClickPrev = () => {
    let activePhraseIndex = this.props.phrases.findIndex(phrase => {
      return phrase.id === this.props.phraseId
    })

    // Already at beginning, do nothing
    if (activePhraseIndex === 0)
      return

    // Load previous Phrase
    let previousPhrase = this.props.phrases[activePhraseIndex-1]
    this.props.dispatch(phraseLoadFromMemory({
      id: previousPhrase.id,
      name: previousPhrase.phrasename,
      username: previousPhrase.username,
      dateCreated: previousPhrase.dateCreated,
      dateModified: previousPhrase.dateModified,
      state: previousPhrase.state,
    }))
  }

  handleTogglePlay = () => {
    this.props.dispatch(transportPlayToggle())
  }

  handleClickNext = () => {
    let activePhraseIndex = this.props.phrases.findIndex(phrase => {
      return phrase.id === this.props.phraseId
    })

    // Already at end, do nothing
    if (activePhraseIndex === this.props.phrases.length - 1)
      return

    // Load next Phrase
    let nextPhrase = this.props.phrases[activePhraseIndex+1]
    this.props.dispatch(phraseLoadFromMemory({
      id: nextPhrase.id,
      name: nextPhrase.phrasename,
      username: nextPhrase.username,
      dateCreated: nextPhrase.dateCreated,
      dateModified: nextPhrase.dateModified,
      state: nextPhrase.state,
    }))
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
    dateModified: state.phraseMeta.dateModified,
    playing: state.transport.playing,
  }
}

export default connect(mapStateToProps)(Library)
