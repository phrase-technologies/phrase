import React, { Component } from 'react'
import TextareaAuto from 'react-textarea-autosize'
import Moment from 'moment'

import UserBubble from 'components/UserBubble'
import { barToString } from 'helpers/trackHelpers'
import { userRequestProfile } from 'reducers/reduceUserProfile'
import { commentSetFocus } from 'reducers/reduceComment'

export default class DiscussionTimelineItem extends Component {

  constructor() {
    super()
    this.state = {
      replying: false,
    }
  }

  render() {
    let discussionTimelineItemClasses = "discussion-timeline-item"
        discussionTimelineItemClasses += this.props.comment.id ? "" : " discussion-timeline-item-pending"

    let user = this.props.user
    if (!user || user.pending) {
      user = {
        username: ""
      }
    }
    let initials = user.username.substring(0,2).toUpperCase()
    let timestamp = Moment(this.props.comment.dateCreated).calendar().toString()

    return (
      <li className={discussionTimelineItemClasses} onClick={this.handleClick}>
        <div className="discussion-timeline-tick">
          { this.getTick(this.props.comment.start) }
        </div>
        <div className="discussion-timeline-meta">
          <UserBubble initials={initials} />
          <span className="user-username">
            { user.username || <span className="fa fa-spinner fa-pulse" /> }
          </span>
          <span className="discussion-timeline-timestamp">
            { timestamp }
          </span>
        </div>
        <div className="discussion-timeline-content enable-select">
          { this.props.comment.comment.split("\n").map((sentence, i) => {
            return (
              <span key={i}>
                {sentence}
                <br/>
              </span>
            )
          })}
        </div>
        <div className="discussion-timeline-actions">
          <a>
            Like
          </a>
          <span> &middot; </span>
          <a onClick={this.openReply}>
            Reply
          </a>

          { this.renderReply(user) }
        </div>
      </li>
    )
  }

  renderReply(user) {
    if (this.state.replying) {
      return (
        <div className="discussion-fullscreen">
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
            onKeyDown={this.keyDownHandler} maxRows={5}
          />
          <div className="discussion-fullscreen-context visible-xs-block">
            <span className="fa fa-level-up fa-flip-horizontal" />
            <span> in reply to </span>
            <span className="discussion-timeline-username">
              { user.username }
            </span>
            <p style={{ marginTop: 5 }}>
              <span className="fa fa-quote-left" />
              <span> { this.props.comment.comment } </span>
              <span className="fa fa-quote-right" />
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  handleClick = () => {
    this.props.dispatch(commentSetFocus({ commentId: this.props.comment.id }))
  }

  openReply = () => {
    // If already open, focus!
    if (this.textarea) {
      this.textarea.focus()
    }

    // Make sure open
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
      // On Mobile, force user to tap the submit button
      if (!this.isMobile()) {
        e.preventDefault()
        this.submitReply()
      }
    }
  }

  isMobile() {
    let style = window.getComputedStyle(this.submitButton)
    return style.display !== 'none'
  }

  submitReply = () => {
    this.closeReply()
  }

  getTick(bar) {
    return bar === null
      ? (<span className="fa fa-globe fa-lg" />)
      : (<span>{ barToString(bar, 0.25) }</span>)
  }

  componentDidUpdate(prevProps, prevState) {
    // Focus the textarea if newly opened!
    if (this.state.replying && !prevState.replying) {
      this.textarea.focus()
    }
  }

  componentWillMount() {
    this.requireUserProfile(this.props.user)
  }

  componentWillReceiveProps(nextProps) {
    this.requireUserProfile(nextProps.user)
  }

  requireUserProfile(user) {
    if (!user) {
      this.props.dispatch(userRequestProfile({ userId: this.props.comment.authorId }))
    }
  }

}
