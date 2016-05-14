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
    return (
      <div className="workstation-header-title-wrapper">
        <AutosizeInput inputClassName="form-control form-control-glow workstation-header-title"
          name="project-name" value={this.state.title}
          placeholder="Untitled Phrase" inputStyle={{ textOverflow: 'ellipsis' }}
          onChange={this.handleChange} onBlur={this.handleBlur}
        />
        <span className="fa fa-pencil" />
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
}

function mapStateToProps(state) {
  return {
    title: state.phraseMeta.phraseName,
  }
}

export default connect(mapStateToProps)(WorkstationHeaderTitle)
