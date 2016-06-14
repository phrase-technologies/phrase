import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

import WorkstationHeaderTitle from './WorkstationHeaderTitle.js'
import WorkstationHeaderAuthor from './WorkstationHeaderAuthor.js'
import WorkstationHeaderStorage from './WorkstationHeaderStorage.js'
import WorkstationHeaderShare from './WorkstationHeaderShare.js'
import TransportTempo from './TransportTempo.js'
import TransportControls from './TransportControls.js'

import { phraseLoginReminder,
         phraseRephraseReminder,
         phraseRephrase,
       } from 'reducers/reducePhrase'

import { exportToMidi } from 'actions/actionsMidi'

export class WorkstationHeader extends Component {

  render() {
    return (
      <div className="workstation-header">
        <div className="container container-maximize" style={{ position: 'relative' }}>
          <div className="btn-toolbar" style={{ position: 'absolute', top: 3, left: 0 }}>
            <div className="btn-group">
              { this.renderMIDIExportButton() }
            </div>
            <div className="btn-group">
              { this.renderRephraseButton() }
            </div>
            <div className="btn-group">
              { this.renderRephraseReminder() }
            </div>
          </div>
          <div className="text-center">
            { this.renderLoginReminder() }
            <div className="btn-group">
              <WorkstationHeaderTitle />
              <WorkstationHeaderAuthor />
            </div>
          </div>
          <div className="btn-toolbar" style={{ position: 'absolute', top: 3, right: 0 }}>
            <div className="btn-group">
              <span className="workstation-header-share">
                Share:
              </span>
            </div>
            <WorkstationHeaderShare />
          </div>
        </div>
        <div className="workstation-divider" />
        <WorkstationHeaderStorage {...this.props} style={{ position: 'absolute', top: 65, left: 10 }} />
        <div className="text-center">
          <div className="btn-toolbar" style={{ display: 'inline-block' }}>
            <TransportTempo />
            <TransportControls />
          </div>
        </div>
        <div className="btn-toolbar" style={{ position: 'absolute', top: 65, right: 10 }}>
          { this.renderEditTool() }
        </div>
      </div>
    )
  }

  renderLoginReminder() {
    return this.props.loginReminder ? (
      <div
        className="popover bottom" onClick={this.dismissLoginReminder}
        style={{ display: 'block', left: 'auto', right: 0, top: -13, color: '#333' }}
      >
        <div className="arrow" style={{ right: 25, left: 'auto' }} />
        <div className="popover-content" style={{ padding: '5px 10px' }}>
          To <strong>save</strong> and <strong>share</strong> your phrase,
          login!
        </div>
      </div>
    ) : null
  }

  renderMIDIExportButton() {
    let disabled = !this.props.existingPhrase && this.props.pristine
    let MIDIExportTooltip = <Tooltip id="tooltip-midi-export">Export to MIDI file (.mid)</Tooltip>

    return (
      <OverlayTrigger placement="top" overlay={MIDIExportTooltip} delayShow={250}>
        <button
          className="btn btn-sm btn-dark"
          disabled={disabled}
          onClick={ () => this.props.dispatch(exportToMidi()) }
         >
          <span className="fa fa-download" />
          <span> MIDI</span>
        </button>
      </OverlayTrigger>
    )
  }

  renderRephraseButton() {
    let RephraseTooltip = <Tooltip id="tooltip-rephrase">Make a copy of this Phrase</Tooltip>

    return this.props.existingPhrase ? (
      <OverlayTrigger placement="top" overlay={RephraseTooltip} delayShow={250}>
        <button className="btn btn-sm btn-bright" onClick={this.rephrase}>
          <span className="fa fa-pencil-square-o" />
          <span> Rephrase</span>
        </button>
      </OverlayTrigger>
    ) : null
  }

  renderRephraseReminder() {
    return this.props.rephraseReminder ? (
      <div
        className="popover right"  onClick={this.dismissRephraseReminder}
        style={{ display: 'block', color: '#333', width: 210 }}
      >
        <div className="arrow" style={{ top: 16 }} />
        <div className="popover-content" style={{ padding: '5px 10px' }}>
          To save your changes to this phrase, <strong>rephrase</strong> it!
          <a className="btn btn-link btn-xs" href="/TODO" target="_blank" style={{ float: 'none', color: '#555' }}>
            <span className="fa fa-question-circle"/> Help
          </a>
        </div>
      </div>
    ) : null
  }

  renderEditTool() {
    return (
      <div className="btn-group">
        <button className="btn btn-dark btn-narrow">
          <span className="fa fa-fw fa-mouse-pointer" />
        </button>
        <button className="btn btn-dark btn-narrow" disabled>
          <span className="fa fa-fw fa-i-cursor" />
        </button>
        <button className="btn btn-dark btn-narrow" disabled>
          <span className="fa fa-fw fa-pencil" />
        </button>
        <button className="btn btn-dark btn-narrow" disabled>
          <span className="fa fa-fw fa-eraser" />
        </button>
        <button className="btn btn-dark btn-narrow" disabled>
          <span className="fa fa-fw fa-scissors fa-rotate-90" />
        </button>
      </div>
    )
  }

  rephrase = () => {
    this.props.dispatch(phraseRephrase())
  }

  dismissRephraseReminder = () => {
    this.props.dispatch(phraseRephraseReminder({ show: false }))
  }

  dismissLoginReminder = () => {
    this.props.dispatch(phraseLoginReminder({ show: false }))
  }

}

function mapStateToProps(state) {
  return {
    undoable: state.phrase.past.length,
    redoable: state.phrase.future.length,
    existingPhrase: state.phraseMeta.phraseId,
    saving: state.phraseMeta.saving,
    pristine: state.phraseMeta.pristine,
    lastSavedTimestamp: state.phraseMeta.dateModified,
    loginReminder: state.phraseMeta.loginReminder,
    rephraseReminder: state.phraseMeta.rephraseReminder,
  }
}

export default connect(mapStateToProps)(WorkstationHeader)
