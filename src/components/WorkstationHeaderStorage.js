import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ActionCreators as UndoActions } from 'redux-undo'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

import { isMacPlatform } from 'helpers/localizationHelpers.js'

export class WorkstationHeaderStorage extends Component {


  render() {
    let UndoTooltip = isMacPlatform() ? <Tooltip>Undo (⌘Z)</Tooltip> : <Tooltip>Undo (Ctrl+Z)</Tooltip>
    let RedoTooltip = isMacPlatform() ? <Tooltip>Redo (⌘Y)</Tooltip> : <Tooltip>Redo (Ctrl+Y)</Tooltip>
    let HistoryTooltip = <Tooltip>Version History</Tooltip>

    return (
      <div className="btn-group">
        {this.renderSave()}
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
    )
  }

  renderSave() {
    if (true)
      return null

    return (
      <button className="btn btn-bright">
        <span className="fa fa-fw fa-save" />
        <span> Save</span>
      </button>
    )
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
