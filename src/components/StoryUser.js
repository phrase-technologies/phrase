import React, { Component } from 'react'

export default class StoryUser extends Component {

  getIcon() {
    switch(this.props.mode)
    {
      default:
      case 'icon':
        return (<a><img className="story-user-photo" src={this.props.userPhoto} /></a>)
      case 'text':
        return null
    }    
  }

  getText() {
    switch(this.props.mode)
    {
      default:
      case 'text':
        return (<a className="story-user-name">{this.props.userName}</a>)
      case 'icon':
        return null
    }    
  }

  render() {
    var icon = this.getIcon()
    var text = this.getText()

    return (
      <span className="story-user">
        {icon} {text}
      </span>
    )
  }
}

StoryUser.propTypes = {
  userPhoto:    React.PropTypes.string.isRequired,
  userName:     React.PropTypes.string.isRequired,
  mode:         React.PropTypes.oneOf(['text','icon','full',null])
}
