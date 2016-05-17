import React, { Component } from 'react'

export default class StoryUser extends Component {

  getIcon() {
    if (this.props.userPhoto)
      return (<a><img className="story-user-photo" src={this.props.userPhoto} /></a>)
    return null
  }

  getText() {
    if (this.props.userName)
      return (<a className="story-user-name">{this.props.userName}</a>)
    return (<span className="story-user-name">anonymous</span>)
  }

  render() {
    let icon = this.getIcon()
    let text = this.getText()

    return (
      <span className="story-user">
        {icon} {text}
      </span>
    )
  }
}

StoryUser.propTypes = {
  userPhoto:    React.PropTypes.string,
  userName:     React.PropTypes.string,
  mode:         React.PropTypes.oneOf(['text','icon','full',null])
}
