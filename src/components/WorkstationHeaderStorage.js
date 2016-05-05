import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ActionCreators as UndoActions } from 'redux-undo'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

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
    if (false)
      return null

    return (
      <button className="btn btn-bright" style={{ borderRadius: 18 }}>
        <span className="fa fa-save" />
        <span> Save</span>
      </button>
    )
  }

  renderStatus() {
    switch("unsaved") {
      case "unsaved":
        return (
          <a className="btn btn-link link-dark" onClick={this.login}>
            <span className="fa fa-warning text-warning" />
            <span className="text-warning"> Unsaved</span>
          </a>
        )
      case "saved":
        return (
          <a className="btn btn-link link-dark">
            <span>Autosaved at 5:17pm</span>
          </a>
        )
      case "saving":
        return (
          <a className="btn btn-link link-dark">
            <span className="text-warning">Saving...</span>
          </a>
        )
      default: return null
    }

  }

  undo = () => {
    this.props.dispatch(UndoActions.undo())
  }

  redo = () => {
    this.props.dispatch(UndoActions.redo())
  }
}

function mapStateToProps(state) {
  return {
    undoable: state.phrase.past.length,
    redoable: state.phrase.future.length,
  }
}

export default connect(mapStateToProps)(WorkstationHeaderStorage)
