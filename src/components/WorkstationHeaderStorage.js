import React, { Component } from 'react'
import { ActionCreators as UndoActions } from 'redux-undo'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Moment from 'moment'

import { modalOpen } from 'reducers/reduceModal.js'
import { isMacPlatform } from 'helpers/localizationHelpers.js'
import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export default class WorkstationHeaderStorage extends Component {

  render() {
    let UndoTooltip = isMacPlatform()
      ? <Tooltip id="tooltip-undo">Undo (⌘Z)</Tooltip>
      : <Tooltip id="tooltip-undo">Undo (Ctrl+Z)</Tooltip>
    let RedoTooltip = isMacPlatform()
      ? <Tooltip id="tooltip-redo">Redo (⌘Y)</Tooltip>
      : <Tooltip id="tooltip-redo">Redo (Ctrl+Y)</Tooltip>
    // let HistoryTooltip = <Tooltip id="tooltip-all-versions">Version History</Tooltip>

    return (
      <div className="btn-toolbar" style={this.props.style}>
        <div className="btn-group">
          <OverlayTrigger placement="top" overlay={UndoTooltip} delayShow={250}>
            <button
              className="btn btn-dark btn-narrow" {...makeButtonUnfocusable}
              disabled={!this.props.undoable} onClick={this.undo}
            >
              <span className="fa fa-fw fa-undo" />
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={RedoTooltip} delayShow={250}>
            <button
              className="btn btn-dark btn-narrow" {...makeButtonUnfocusable}
              disabled={!this.props.redoable} onClick={this.redo}
            >
              <span className="fa fa-fw fa-repeat" />
            </button>
          </OverlayTrigger>
          {/*
          <OverlayTrigger placement="top" overlay={HistoryTooltip} delayShow={250}>
            <button className="btn btn-dark btn-narrow" disabled>
              <span className="caret" />
            </button>
          </OverlayTrigger>
          */}
        </div>
        <div className="btn-group">
          { this.renderStatus() }
        </div>
      </div>
    )
  }

  renderStatus() {
    // Saving in progress
    if (this.props.saving) {
      return (
        <span className="btn btn-link link-dark" style={{ cursor: 'default' }}>
          <span className="text-warning">Saving...</span>
        </span>
      )
    }

    // Autosave
    if (this.props.existingPhrase && this.props.pristine) {
      let timestamp = (Date.now() - this.props.lastSavedTimestamp < 1000) // Just saved?
                    ? "Autosaved."
                    : `Last edit: ${Moment(this.props.lastSavedTimestamp).fromNow().toString()}`
      let timestampTooltip = (
        <Tooltip id="tooltip-exact-timestamp">
          {Moment(this.props.lastSavedTimestamp).format('llll').toString()}
        </Tooltip>
      )

      return (
        <OverlayTrigger placement="top" overlay={timestampTooltip} delayShow={250}>
          <span className="btn btn-link link-dark" style={{ cursor: 'default' }}>
            <span className="text-muted">{timestamp}</span>
          </span>
        </OverlayTrigger>
      )
    }

    // Unsaved
    if (!this.props.pristine) {
      let UnsavedTooltip = <Tooltip id="tooltip-unsaved">Please login to save!</Tooltip>
      return (
        <OverlayTrigger placement="top" overlay={UnsavedTooltip} delayShow={250}>
          <a className="btn btn-link link-dark" onClick={this.login}>
            <span className="fa fa-warning text-danger" />
            <span className="text-danger"> Unsaved</span>
          </a>
        </OverlayTrigger>
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
      modalComponent: 'LoginModal',
    }))
  }
}
