import React, { Component } from 'react'
import AutosizeInput from 'react-input-autosize'

export default class WorkstationHeaderTitle extends Component {
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
          name="project-name" value={this.props.title || this.state.title}
          placeholder="Untitled Project"
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
        <span className="fa fa-pencil" />
      </div>
    )
  }

  handleChange = (e) => {
    this.setState({ title: e.target.value })
  }

  handleBlur = (e) => {
    // this.dispatch(phraseRename(e.target.value))
    this.setState({ title: "" })
  }
}
