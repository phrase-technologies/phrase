import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ActionCreators as UndoActions } from 'redux-undo'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Moment from 'moment'

import { modalOpen } from 'reducers/reduceModal.js'
import { isMacPlatform } from 'helpers/localizationHelpers.js'

export class WorkstationHeaderStorage extends Component {

  render() {
    let UndoTooltip = isMacPlatform()
      ? <Tooltip id="tooltip-undo">Undo (⌘Z)</Tooltip>
      : <Tooltip id="tooltip-undo">Undo (Ctrl+Z)</Tooltip>
    let RedoTooltip = isMacPlatform()
      ? <Tooltip id="tooltip-redo">Redo (⌘Y)</Tooltip>
      : <Tooltip id="tooltip-redo">Redo (Ctrl+Y)</Tooltip>
    let HistoryTooltip = <Tooltip id="tooltip-all-versions">Version History</Tooltip>

    return (
      <div className="btn-toolbar" style={this.props.style}>
        <div className="btn-group">
          <OverlayTrigger placement="top" overlay={UndoTooltip} delayShow={250}>
            <button
              className="btn btn-dark btn-narrow"
              disabled={!this.props.undoable} onClick={this.undo}
            >
              <span className="fa fa-fw fa-undo" />
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={RedoTooltip} delayShow={250}>
            <button
              className="btn btn-dark btn-narrow"
              disabled={!this.props.redoable} onClick={this.redo}
            >
              <span className="fa fa-fw fa-repeat" />
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={HistoryTooltip} delayShow={250}>
            <button className="btn btn-dark btn-narrow" disabled>
              <span className="caret" />
            </button>
          </OverlayTrigger>
        </div>
        <div className="btn-group">
          { this.renderStatus() }
          { this.renderSave() }
        </div>
      </div>
    )
  }

  renderSave() {
    if (this.props.existingPhrase || this.props.pristine)
      return null

    return (
      <button className="btn btn-bright" style={{ borderRadius: 18 }} onClick={this.login}>
        <span className="fa fa-save" />
        <span> Save</span>
      </button>
    )
  }

  renderStatus() {
    // Autosave
    if (this.props.existingPhrase) {
      // Saving in progress
      if (this.props.saving) {
        return (
          <a className="btn btn-link link-dark">
            <span className="text-warning">Saving...</span>
          </a>
        )
      }

      // Save completed
      let timestamp = (Date.now() - this.props.lastSavedTimestamp < 1000) // Just saved?
                    ? "Autosaved."
                    : `Last change: ${Moment(this.props.lastSavedTimestamp).calendar().toString()}`
      return (
        <a className="btn btn-link link-dark">
          <span className="text-warning">{timestamp}</span>
        </a>
      )
    }

    // Unsaved
    if (!this.props.pristine) {
      return (
        <a className="btn btn-link link-dark" onClick={this.login}>
          <span className="fa fa-warning text-warning" />
          <span className="text-warning"> Unsaved</span>
        </a>
      )
    }

    // Pristine
    return null
  }

  undo = () => {
    this.props.dispatch(UndoActions.undo())
  }

  redo = () => {
    this.props.dispatch(UndoActions.redo())
  }

  login = () => {
    this.props.dispatch(modalOpen({
      modalComponent: 'SignupModal',
    }))
  }
}

function mapStateToProps(state) {
  return {
    undoable: state.phrase.past.length,
    redoable: state.phrase.future.length,
    pristine: !state.phrase.past.length && !state.phrase.future.length,
    existingPhrase: state.phraseMeta.phraseId,
    saving: state.phraseMeta.saving,
    lastSavedTimestamp: state.phraseMeta.dateCreated,
  }
}

export default connect(mapStateToProps)(WorkstationHeaderStorage)
