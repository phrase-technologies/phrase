import React, { Component } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import ReactSelect from 'react-select'

import isEmail from 'helpers/isEmail'
import { api } from 'helpers/ajaxHelpers'

import PermissionsOption from 'components/PermissionsOption'
import UserBubble from 'components/UserBubble'
import LinkShare from 'components/LinkShare'

import { modalClose } from 'reducers/reduceModal.js'
import { setPrivacySetting, addCollaborator, removeCollaborator } from 'reducers/reducePhraseMeta'

export class PermissionsModal extends Component {
  state = {
    selectedPermission: "",
    choosingPermissions: false,
    loadingPermissions: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.phraseMeta.privacySetting !== nextProps.phraseMeta.privacySetting) {
      this.setState({ loadingPermissions: false })
      this.closePermissions()
    }
  }

  permissionsOptions = [
    {
      type: "private",
      title: "Private Session",
      description: "Only collaborators listed above can access this session",
      icon: "lock",
      iconSize: 1,
    },
    /*
    {
      type: "link",
      title: "Link-only Access",
      description: "Anyone with the link can access this session",
      icon: "link",
      iconSize: 1,
    },
    */
    {
      type: "public",
      title: "Public Session",
      description: "Anyone with the link can access this session",
      icon: "globe",
      iconSize: 2,
    },
  ]

  autocompleteUsers = _.debounce((input, callback) => {
    api({
      endpoint: `searchUsers`,
      body: { searchTerm: input },
    }).then(({ users = [] }) => {
      callback(null, {
        options: users
          // .filter(x => x.userId !== localStorage.userId) // could extend endpoint for this but nbd
          .map(x => ({ value: x.userId, label: x.username }))
      })
    }).catch((error) => {
      callback(error, null)
    })
  }, 250)

  render() {
    return (
      <Modal show={this.props.show} onHide={this.closeModal} keyboard={false} enforceFocus={false}>
        <Modal.Body>
          <button type="button" className="close" onClick={this.closeModal}>&times;</button>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="collaborator-input">
              Invite Collaborators
            </label>
            <ReactSelect.AsyncCreatable
              name="collaborator-input"
              placeholder="Email or Username"
              loadOptions={this.autocompleteUsers}
              onChange={this.inviteCollaborator}
              autoload={false} ignoreCase={true}
              isValidNewOption={params => isEmail(params.label)}
              promptTextCreator={label => `Send invitation to ${label}`}
              filterOptions={options => options.filter(option => !option.className)}
            />
          </div>

          <ul className="user-collaborator-list">
            <li>
              <UserBubble userId={this.props.phraseMeta.userId} />
              <span className="user-username">
                {this.props.phraseMeta.authorUsername} <strong>(Owner)</strong>
              </span>
            </li>
            {this.props.phraseMeta.collaborators
              .map(user => {
                let username
                if (isEmail(user)) {
                  username = user
                } else {
                  username = this.props.users[user]
                    ? this.props.users[user].username
                    : <span className="fa fa-spinner fa-pulse" />
                }
                return (
                  <li key={user}>
                    <UserBubble userId={user} />
                    <span className="user-username">
                      { username }
                      <a
                        style={{ marginLeft: `0.5rem` }}
                        onClick={() => this.props.dispatch(removeCollaborator({ targetUserId: user }))}
                      >
                        <strong>Remove</strong>
                      </a>
                    </span>
                  </li>
                )
              }
            )}
          </ul>

          {
            this.props.phraseMeta.privacySetting !== 'private'
            && (
              <div>
                <small>Link to share</small>
                <LinkShare />
              </div>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <div
            style={{
              backgroundColor: `rgba(202, 202, 202, 0.8)`,
              position: `absolute`,
              top: 0,
              left: 0,
              width: `100%`,
              height: `100%`,
              zIndex: 10,
              transition: `opacity 0.35s ease`,
              opacity: this.state.loadingPermissions ? 1 : 0,
              pointerEvents: `none`,
            }}
          />
          { this.renderPermissions() }
        </Modal.Footer>
      </Modal>
    )
  }

  renderPermissions() {
    if (this.state.choosingPermissions || this.state.loadingPermissions) {
      return (
        <form style={{ textAlign: 'left' }}>
          {
            this.permissionsOptions.map((option, index) => {
              return (
                <div className="radio" key={index}>

                  <label>
                    <input
                      type="radio" name="permission_option"
                      value={option.type} checked={option.type === this.state.selectedPermission}
                      style={{ marginTop: 12 }}
                      onChange={this.selectPermissions}
                    />
                    <PermissionsOption option={option} />
                  </label>
                </div>
              )
            })
          }
          <button
            type="submit" className="btn btn-primary btn-sm"
            style={{ position: 'absolute', right: 105, bottom: 15, width: 80 }}
            onClick={this.savePermissions}
          >
            Save
          </button>
          <button
            type="submit" className="btn btn-bright btn-sm"
            style={{ position: 'absolute', right: 15, bottom: 15, width: 80 }}
            onClick={this.closePermissions}
          >
            Cancel
          </button>
        </form>
      )
    }

    let option = this.permissionsOptions.find(x => x.type === this.props.phraseMeta.privacySetting)
    return (
      <div className="row" style={{ marginBottom: 0, textAlign: 'left' }}>
        <div className="col-xs-8">
          <PermissionsOption option={option} />
        </div>
        { option.type !== "private" &&
        <div className="col-xs-4 text-right">
          <button className="btn btn-link link-primary" onClick={this.expandPermissions}>
            <span>Change </span>
            <span className="fa fa-sort" />
          </button>
        </div>
        }
      </div>
    )
  }

  inviteCollaborator = (params) => {
    if (params.className === "Select-create-option-placeholder") {
      this.props.dispatch(addCollaborator({
        targetUserEmail: params.value
      }))
    } else {
      this.props.dispatch(addCollaborator({
        targetUserId: params.value
      }))
    }
  }
  expandPermissions = () => {
    this.setState({
      choosingPermissions: true,
      selectedPermission: this.props.phraseMeta.privacySetting,
    })
  }
  selectPermissions = (e) => {
    this.setState({ selectedPermission: e.currentTarget.value })
  }
  savePermissions = (e) => {
    this.setState({ loadingPermissions: true })
    this.props.dispatch(setPrivacySetting({ privacySetting: this.state.selectedPermission }))
    e.preventDefault()
  }
  closePermissions = (e) => {
    this.setState({ choosingPermissions: false })
    if (e) e.preventDefault()
  }
  closeModal = () => {
    this.props.dispatch(modalClose())
  }

}

function mapStateToProps(state) {
  return {
    phraseMeta: state.phraseMeta,
    users: state.userProfile.users,
  }
}

export default connect(mapStateToProps)(PermissionsModal)
