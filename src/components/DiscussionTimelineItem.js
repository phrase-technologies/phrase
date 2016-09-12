import React, { Component } from 'react'
import TextareaAuto from 'react-textarea-autosize'
import DiscussionUser from 'components/DiscussionUser'

export default class DiscussionTimelineItem extends Component {

  constructor() {
    super()
    this.state = {
      replying: false,
    }
  }

  render() {
    return (
      <li className="discussion-timeline-item">
        <div className="discussion-timeline-tick">
          { this.props.tick }
        </div>
        <div className="discussion-timeline-meta">
          <DiscussionUser>
            { this.props.user.initials }
          </DiscussionUser>
          <span className="discussion-timeline-username">
            { this.props.user.username }
          </span>
          <span className="discussion-timeline-timestamp">
            { this.props.timestamp }
          </span>
        </div>
        <div className="discussion-timeline-content enable-select">
          { this.props.comment }
        </div>
        <div className="discussion-timeline-actions">
          <a>
            Like
          </a>
          <span> &middot; </span>
          <a onClick={this.openReply}>
            Reply
          </a>

          { this.renderReply() }
        </div>
      </li>
    )
  }

  renderReply() {
    if (this.state.replying) {
      return (
        <form className="discussion-fullscreen">
          <button className="close close-dark visible-xs-inline-block" onClick={this.closeReply}>
            &times;
          </button>
          <div className="discussion-fullscreen-header visible-xs-block visible-xs-block">
            <button
              className="btn btn-primary btn-sm discussion-fullscreen-submit visible-xs-inline-block"
              ref={ref => this.submitButton = ref} onClick={this.submitReply}
            >
              Reply
            </button>
          </div>
          <TextareaAuto
            className="discussion-timeline-reply form-control form-control-dark"
            placeholder="Write a reply..." ref={ref => this.textarea = ref}
            onKeyDown={this.keyDownHandler}
          />
          <div className="discussion-fullscreen-context visible-xs-block">
            <span className="fa fa-level-up fa-flip-horizontal" />
            <span> in reply to </span>
            <span className="discussion-timeline-username">
              { this.props.user.username }
            </span>
            <p style={{ marginTop: 5 }}>
              <span className="fa fa-quote-left" />
              <span> { this.props.comment } </span>
              <span className="fa fa-quote-right" />
            </p>
          </div>
        </form>
      )
    }

    return null
  }

  openReply = () => {
    this.props.setFullscreenReply(true)
    this.setState({ replying: true })
  }

  closeReply = () => {
    this.props.setFullscreenReply(false)
    this.setState({ replying: false })
  }

  keyDownHandler = (e) => {
    // Only submit on regular Enter (SHIFT+Enter reserved for newlines)
    if (e.keyCode === 13 && !e.shiftKey) {
      let style = window.getComputedStyle(this.submitButton)
      let isMobile = style.display !== 'none'
      console.log( "isMobile", isMobile, style.display, this.submitButton )
      // On Mobile, force user to use the
      if (!isMobile)
        this.submitReply()
    }
  }

  submitReply = () => {
    this.closeReply()
  }

  componentDidUpdate() {
    // Focus the textarea if opened!
    if (this.state.replying) {
      this.textarea.focus()
    }
  }

}
