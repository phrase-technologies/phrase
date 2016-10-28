import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import TextareaAuto from 'react-textarea-autosize'

import UserBubble from 'components/UserBubble'
import DiscussionTimeline from 'components/DiscussionTimeline'

import { modalOpen } from 'reducers/reduceModal'
import { addMasterControl, removeMasterControl } from 'reducers/reducePhraseMeta'
import { commentSelectionClear } from 'reducers/reduceComment'
import { arrangeToolSelect } from 'reducers/reduceArrangeTool'
import { barToString } from 'helpers/trackHelpers'
import { commentCreate } from 'reducers/reduceComment'

export class Discussion extends Component {
  state = {
    fullscreenReply: false,
    formHeight: 90,
    formValue: "",
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

    let formFocused = (this.state.formFocused || this.props.arrangeTool === 'comment') && !this.props.commentId
    let discussionFormInputClasses = "discussion-form-input form-control form-control-dark"
        discussionFormInputClasses += formFocused ? " focused" : ''
    let discussionFormAttachmentClasses = "form-control form-control-dark discussion-form-attachment"
        discussionFormAttachmentClasses += formFocused ? ' focused' : ''

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
                : this.props.collaborators.find(x => x === this.props.userId)
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
                  // this.props.dispatch(addMasterControl({ targetUserId: this.props.userId }))
                  // this.setState({ loadingMasterControl: this.props.userId })
                }
              }
            }
            userId={this.props.userId}
            loadingMasterControl={this.state.loadingMasterControl === this.props.userId}
            masterControl={this.props.masterControl.includes(this.props.userId)}
            online
          />
          { this.props.authorUserId !== this.props.userId &&
            <UserBubble
              type={`author`}
              key={`collab-${this.props.authorUserId}`}
              handleClick={
                () => {
                    // this.props.dispatch(addMasterControl({ targetUserId: this.props.authorUserId }))
                    // this.setState({ loadingMasterControl: this.props.authorUserId })
                }
              }
              userId={this.props.authorUserId}
              loadingMasterControl={this.state.loadingMasterControl === this.props.authorUserId}
              masterControl={this.props.masterControl.includes(this.props.authorUserId)}
              online={this.props.users.find(user => user.userId === this.props.authorUserId)}
            />
          }
          {this.props.collaborators
          .filter(x => x !== this.props.userId && x !== this.props.authorUserId)
          .map(x =>
            <UserBubble
              type="collaborator"
              key={`collab-${x}`}
              handleClick={
                () => {
                  if (this.props.authorUserId === this.props.userId) {
                    // if (this.props.masterControl.includes(x)) {
                    //   this.props.dispatch(removeMasterControl())
                    // } else {
                    //   this.props.dispatch(addMasterControl({ targetUserId: x }))
                    //   this.setState({ loadingMasterControl: x })
                    // }
                  }
                }
              }
              userId={x}
              loadingMasterControl={this.state.loadingMasterControl === x}
              masterControl={this.props.masterControl.includes(x)}
              online={
                x === this.props.userId ||
                this.props.users.find(user => user.userId === x)
              }
            />
          )}
          {this.props.users
          .filter(x => !this.props.collaborators.find(c => c === x.userId) && x.userId !== this.props.authorUserId)
          .map(x =>
            <UserBubble
              type={this.props.authorUserId === x.userId ? `author` : `observer`}
              key={`observer-${x.userId}`}
              userId={x.userId}
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
            ref={this.saveScrollWindowRef}
          >
            <DiscussionTimeline
              setFullscreenReply={this.setFullscreenReply}
              scrollTimeline={this.scrollTimeline}
            />
          </div>
        </div>
        <button
          className="discussion-form-mobile-trigger btn btn-bright btn-sm visible-xs-inline-block"
          onClick={this.replyOpen}
        >
          <span className="fa fa-comment-o fa-flip-horizontal" />
          <span> Leave a comment</span>
        </button>
        <div className={discussionFormClasses} style={discussionFormStyles}>
          <button
            className="close close-dark visible-xs-inline-block"
            onClick={this.replyClose}
          >
            &times;
          </button>
          <TextareaAuto
            className={discussionFormInputClasses}
            placeholder="Leave a comment..." ref={ref => this.textarea = ref}
            onKeyDown={this.keyDownHandler} minRows={2} maxRows={5}
            onHeightChange={(height) => this.handleHeightChange({ inputHeight: height })}
            onFocus={this.formFocus} value={this.state.formValue}
            onBlur={this.formBlur} onChange={this.handleInputChange}
          />
          <div className={discussionFormAttachmentClasses}>
            { this.renderCommentTag() }
          </div>
          <button
            className="discussion-form-submit btn btn-primary btn-sm visible-xs-inline-block"
            ref={ref => this.submitButton = ref}
          >
            Comment
          </button>
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
    if (this.props.commentId)
      this.props.dispatch(commentSelectionClear())
    this.handleHeightChange({ focus: true })
  }
  formBlur = () => {
    // Delay blur to a later tick so that clear/select range click events get caught before closing due to blur
    setTimeout(() => this.handleHeightChange({ focus: false }), 125)
  }

  handleHeightChange = ({ inputHeight = null, focus = null, commentMode = null }) => {
    inputHeight = inputHeight || this.state.formInputHeight
    focus = (focus === null) ? this.state.formFocused : focus
    commentMode = (commentMode === null) ? (this.props.arrangeTool === "comment" && !this.props.commentId) : commentMode

    let attachmentHeight = (focus || commentMode) ? 24 : 0

    this.setState({
      formFocused: focus,
      formInputHeight: inputHeight,
      formHeight: inputHeight + attachmentHeight + 23,
    })
  }

  replyOpen = () => {
    this.setState({ formMobileOpen: true })
  }

  replyClose = () => {
    this.setState({ formMobileOpen: false })
  }

  handleInputChange = (e) => {
    this.setState({ formValue: e.target.value })
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

  saveScrollWindowRef = (ref) => {
    this.scrollWindow = ReactDOM.findDOMNode(ref)
  }

  scrollTimeline = (newPosition) => {
    let oldPosition = this.scrollWindow.scrollTop
    let totalDelta = newPosition - oldPosition
    let count = 10
    let delta = Math.ceil(totalDelta * 0.10)
    let animationInterval = setInterval(() => {
      count--
      this.scrollWindow.scrollTop = this.scrollWindow.scrollTop + delta
      if (count <= 0)
        clearInterval(animationInterval)
    }, 16)
  }

  isMobile() {
    let style = window.getComputedStyle(this.submitButton)
    return style.display !== 'none'
  }

  submitReply = () => {
    if (!this.state.formValue) // Cannot be empty comment
      return

    this.textarea.blur()
    this.props.dispatch(commentCreate({ commentText: this.state.formValue }))
    this.setState({ formValue: "" })
    this.replyClose()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.arrangeTool !== this.props.arrangeTool &&
        nextProps.arrangeTool === 'comment' ||
        this.props.arrangeTool === 'comment'
    ) {
      let commentMode = nextProps.arrangeTool === 'comment' && !nextProps.commentId
      this.handleHeightChange({ commentMode })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Focus the textarea if newly opened on mobile!
    if (this.state.formMobileOpen && !prevState.formMobileOpen) {
      this.textarea.focus()
    }

    // Focus the textarea if we just finished selecting a new comment range
    if (!prevProps.commentReady && this.props.commentReady) {
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
  arrangeTool: state.arrangeTool.currentTool,
  phraseId: state.phraseMeta.phraseId,
  authorUsername: state.phraseMeta.authorUsername,
  authorUserId: state.phraseMeta.userId,
  collaborators: state.phraseMeta.collaborators,
  masterControl: state.phraseMeta.masterControl,
  currentUsername: state.auth.user.username,
  userId: state.auth.user.id,
  users: state.presence.users,
  commentId: state.comment.commentId,
  commentReady: state.comment.commentReady,
}))(Discussion)
