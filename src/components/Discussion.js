import React, { Component } from 'react'
import { connect } from 'react-redux'
import TextareaAuto from 'react-textarea-autosize'

import UserBubble from 'components/UserBubble'
import DiscussionTimeline from 'components/DiscussionTimeline'

import { modalOpen } from 'reducers/reduceModal'
import { addMasterControl, removeMasterControl } from 'reducers/reducePhraseMeta'
import { commentSelectionClear } from 'reducers/reduceComment.js'
import { arrangeToolSelect } from 'reducers/reduceArrangeTool'
import { barToString } from '../helpers/trackHelpers.js'

export class Discussion extends Component {
  state = {
    fullscreenReply: false,
    formHeight: 90,
    formFocused: false,
    formMobileOpen: false,
    loadingMasterControl: false
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.masterControl[0] !== nextProps.masterControl[0]) {
      this.setState({ loadingMasterControl: false })
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    // This override is necessary for mobile web, where position fixed
    // gets nixxed by ancestral elements with overflow scroll.
    let fullscreenOverride = this.state.fullscreenReply
      ? " discussion-fullscreen-override"
      : ""

    // This override adjusts form height based on textarea content
    let discussionFormStyles = { height: this.state.formHeight }
    let discussionFormClasses = `discussion-form ${this.state.formMobileOpen ? '' : 'hidden-xs'}`

    let discussionFormInputClasses = "discussion-form-input form-control form-control-dark"
        discussionFormInputClasses += this.state.formFocused || this.props.arrangeTool === "comment" ? " focused" : ''
    let discussionFormAttachmentClasses = "form-control form-control-dark discussion-form-attachment"
        discussionFormAttachmentClasses += this.state.formFocused || this.props.arrangeTool === "comment" ? ' focused' : ''

    return (
      <div className="workstation-discussion">
        <div className="discussion-presence">
          <div className="discussion-presence-all">
            In this session:
          </div>
          <UserBubble
            type={
              this.props.authorUserId === this.props.userId
                ? `author`
                : this.props.collaborators.find(x => x.userId === this.props.userId)
                  ? `collaborator`
                  : `observer`
            }
            key={`collab-${this.props.userId}`}
            handleClick={
              () => {
                if (
                  this.props.authorUserId === this.props.userId &&
                  !this.props.masterControl.includes(this.props.userId)
                ) {
                  this.props.dispatch(addMasterControl({ targetUserId: this.props.userId }))
                  this.setState({ loadingMasterControl: this.props.userId })
                }
              }
            }
            initials={this.props.currentUsername.substr(0, 2).toUpperCase()}
            loadingMasterControl={this.state.loadingMasterControl === this.props.userId}
            masterControl={this.props.masterControl.includes(this.props.userId)}
            online
          />
          {this.props.collaborators
          .filter(x => x.userId !== this.props.userId)
          .map(x =>
            <UserBubble
              type="collaborator"
              key={`collab-${x.userId}`}
              handleClick={
                () => {
                  if (this.props.authorUserId === this.props.userId) {
                    if (this.props.masterControl.includes(x.userId)) {
                      this.props.dispatch(removeMasterControl())
                    } else {
                      this.props.dispatch(addMasterControl({ targetUserId: x.userId }))
                      this.setState({ loadingMasterControl: x.userId })
                    }
                  }
                }
              }
              initials={x.username.substr(0, 2).toUpperCase()}
              loadingMasterControl={this.state.loadingMasterControl === x.userId}
              masterControl={this.props.masterControl.includes(x.userId)}
              online={
                x.userId === this.props.userId ||
                this.props.users.find(user => user.userId === x.userId)
              }
            />
          )}
          {this.props.users
          .filter(x =>
            !this.props.collaborators.find(c => c.userId === x.userId)
          )
          .map(x =>
            <UserBubble
              type={this.props.authorUserId === x.userId ? `author` : `observer`}
              key={`observer-${x.userId}`}
              initials={x.username.substr(0, 2).toUpperCase()}
              masterControl={this.props.masterControl.includes(x.userId)}
              online
            />
          )}
          <button
            disabled={!this.props.phraseId || (this.props.currentUsername !== this.props.authorUsername)}
            className="btn btn-primary btn-sm discussion-invite"
            onClick={this.openPermissions}
          >
            <span className="fa fa-share" />
            <span> Share</span>
          </button>
        </div>
        <div className="discussion-body" style={{ bottom: this.state.formHeight }}>
          <div
            className={"discussion-timeline-gutter" + fullscreenOverride}
            ref={ref => this.scrollWindow = ref}
          >
            <DiscussionTimeline setFullscreenReply={this.setFullscreenReply} />
          </div>
        </div>
        <button
          className="discussion-form-mobile-trigger btn btn-bright btn-sm visible-xs-inline-block"
          onClick={() => this.setState({ formMobileOpen: true })}
        >
          <span className="fa fa-comment-o fa-flip-horizontal" />
          <span> Leave a comment</span>
        </button>
        <div className={discussionFormClasses} style={discussionFormStyles}>
          <button
            className="close close-dark visible-xs-inline-block"
            onClick={() => this.setState({ formMobileOpen: false })}
          >
            &times;
          </button>
          <TextareaAuto
            className={discussionFormInputClasses}
            placeholder="Leave a comment..." ref={ref => this.textarea = ref}
            onKeyDown={this.keyDownHandler} minRows={2} maxRows={5}
            onHeightChange={(height) => this.handleHeightChange({ inputHeight: height })}
            onFocus={this.formFocus}
            onBlur={this.formBlur}
          />
          <div className={discussionFormAttachmentClasses}>
            { this.renderCommentTag() }
          </div>
          <div className="text-right" style={{ marginTop: 8 }}>
            <button className="btn btn-dark btn-sm visible-xs-inline-block" style={{ marginRight: 5 }}>
              Cancel
            </button>
            <button className="btn btn-bright btn-sm visible-xs-inline-block">
              Comment
            </button>
          </div>
        </div>
      </div>
    )
  }

  renderCommentTag() {
    if (this.props.commentRangeEnd !== null && this.props.commentRangeStart !== this.props.commentRangeEnd) {
      let rangeLeft  = Math.min(this.props.commentRangeStart, this.props.commentRangeEnd)
      let rangeRight = Math.max(this.props.commentRangeStart, this.props.commentRangeEnd)
      return (
        <span>
          <span> Commenting on region from </span>
          <span className="fa fa-clock-o" />
          <span> { barToString(rangeLeft, 0.25) }</span>
          <span> to </span>
          <span className="fa fa-clock-o" />
          <span> { barToString(rangeRight, 0.25) } </span>
          <a onClick={() => this.props.dispatch(commentSelectionClear())}>
            <span className="fa fa-remove" />
            <span> Clear</span>
          </a>
        </span>
      )
    }

    if (this.props.commentRangeStart !== null) {
      return (
        <span>
          <span> Commenting at </span>
          <span className="fa fa-clock-o" />
          <span> { barToString(this.props.commentRangeStart, 0.25) } </span>
          <a onClick={() => this.props.dispatch(commentSelectionClear())}>
            <span className="fa fa-remove" />
            <span> Clear</span>
          </a>
        </span>
      )
    }

    return (
      <span>
        <span> Nothing selected on the timeline. </span>
        <a onClick={() => this.props.dispatch(arrangeToolSelect(`comment`))}>
          <span className="fa fa-sort fa-rotate-90" />
          <span> Select a region</span>
        </a>
      </span>
    )
  }

  setFullscreenReply = (booleanStatus) => {
    this.freezeScrollWindow(booleanStatus)

    this.setState({ fullscreenReply: booleanStatus })
  }

  // This is a hack to prevent background scrolling in iOS Safari when position: fixed input gets focused.
  // See: http://stackoverflow.com/a/32389421/476426
  freezeScrollWindow(booleanStatus) {
    // Freeze (record) the scroll position before entering fullscreen
    if (!this.state.fullscreenReply && booleanStatus)
      this.scrollPosition = this.scrollWindow.scrollTop

    // Unfreeze (reset) the scroll position if leaving fullscreen
    if (this.state.fullscreenReply && !booleanStatus)
      this.scrollWindow.scrollTop = this.scrollPosition
  }

  openPermissions = () => {
    this.props.dispatch(modalOpen({ modalComponent: 'PermissionsModal' }))
  }

  formFocus = () => {
    this.handleHeightChange({ focus: true })
  }
  formBlur = () => {
    // Delay blur to a later tick so that click events get caught
    setTimeout(() => { this.handleHeightChange({ focus: false }) }, 250)
  }

  handleHeightChange = ({ inputHeight = null, focus = null, commentMode = null }) => {
    inputHeight = inputHeight || this.state.formInputHeight
    focus = (focus === null) ? this.state.formFocused : focus
    commentMode = (commentMode === null) ? (this.props.arrangeTool === "comment") : commentMode

    let attachmentHeight = (focus || commentMode) ? 24 : 0

    this.setState({
      formFocused: focus,
      formInputHeight: inputHeight,
      formHeight: inputHeight + attachmentHeight + 23,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.arrangeTool !== this.props.arrangeTool &&
        nextProps.arrangeTool === 'comment' ||
        this.props.arrangeTool === 'comment'
    ) {
      let commentMode = nextProps.arrangeTool === 'comment'
      this.handleHeightChange({ commentMode })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Focus the textarea if newly opened on mobile!
    if (this.state.formMobileOpen && !prevState.formMobileOpen) {
      this.textarea.focus()
    }

    // If being focused, clear comment selection range
    if (this.state.formFocused && !prevState.formFocused && this.props.arrangeTool !== 'comment') {
      this.props.dispatch(commentSelectionClear())
    }
  }

}

export default connect(state => ({
  ...state.comment,
  arrangeTool: state.arrangeTool,
  phraseId: state.phraseMeta.phraseId,
  authorUsername: state.phraseMeta.authorUsername,
  authorUserId: state.phraseMeta.userId,
  collaborators: state.phraseMeta.collaborators,
  masterControl: state.phraseMeta.masterControl,
  currentUsername: state.auth.user.username,
  userId: state.auth.user.id,
  users: state.presence.users,
}))(Discussion)
