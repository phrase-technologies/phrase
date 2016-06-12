import React, { Component } from 'react'
import { connect } from 'react-redux'
import AutosizeInput from 'react-input-autosize'
import { phraseRename } from 'reducers/reducePhrase.js'

export class WorkstationHeaderTitle extends Component {

  constructor(props) {
    super()
    this.state = {
      title: props.title || "",
    }
  }

  render() {
    // Editable Title
    let loggedIn = this.props.currentUsername
    let ownerOfPhrase = this.props.currentUsername === this.props.authorUsername
    let newPhrase = !this.props.authorUsername
    if (loggedIn && ownerOfPhrase || newPhrase) {
      return (
        <div className="workstation-header-title-wrapper">
          <AutosizeInput inputClassName="form-control form-control-glow workstation-header-title"
            name="project-name" value={this.state.title}
            placeholder="Untitled Phrase" inputStyle={{ textOverflow: 'ellipsis' }}
            onChange={this.handleChange} onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
          />
          <span className="fa fa-pencil" />
        </div>
      )
    }

    // Read-only Title
    return (
      <div className="workstation-header-title-wrapper">
        <div className="workstation-header-title">
          { this.props.title || (<em>Untitled Phrase</em>) }
        </div>
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ title: nextProps.title })
  }

  handleChange = (e) => {
    this.setState({ title: e.target.value })
  }

  handleBlur = (e) => {
    this.props.dispatch(phraseRename(e.target.value))
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13) { // Enter - Submit changed name
      e.target.blur()
    }
  }

}

function mapStateToProps(state) {
  return {
    title: state.phraseMeta.phraseName,
    authorUsername: state.phraseMeta.authorUsername,
    currentUsername: state.auth.user.username,
  }
}

export default connect(mapStateToProps)(WorkstationHeaderTitle)
