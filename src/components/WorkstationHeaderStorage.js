import React, { Component } from 'react'

export default class WorkstationHeaderStorage extends Component {
  render() {
    return (
      <div className="btn-group">
        {this.renderSave()}
        <button className="btn btn-dark btn-narrow">
          <span className="fa fa-fw fa-undo" />
        </button>
        <button className="btn btn-dark btn-narrow" disabled>
          <span className="fa fa-fw fa-repeat" />
        </button>
        <button className="btn btn-dark btn-narrow">
          <span className="caret" />
        </button>
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
}
