import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import PermissionsOption from 'components/PermissionsOption'
import UserBubble from 'components/UserBubble'
import LinkShare from 'components/LinkShare'
import { modalClose } from 'reducers/reduceModal.js'

export class PermissionsModal extends Component {

  constructor() {
    super()
    this.state = {
      savedPermission: "private",
      selectedPermission: "private",
      choosingPermissions: false,
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

  render() {
    return (
      <Modal show={this.props.show} onHide={this.closeModal} className="">
        <Modal.Body>
          <button type="button" className="close" onClick={this.closeModal}>&times;</button>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="collaborator-input">
              Invite Collaborators
            </label>
            <input id="collaborator-input"
              className="form-control input-sm" type="text"
              placeholder="Email or Username" ref={(ref) => this.email = ref}
            />
          </div>

          <ul className="user-collaborator-list">
            <li>
              <UserBubble>
                AK
              </UserBubble>
              <span className="user-username">
                ProfessorAnson <strong>(Owner)</strong>
              </span>
            </li>
            <li>
              <UserBubble>
                ZZ
              </UserBubble>
              <span className="user-username">
                zavoshz
              </span>
            </li>
            <li>
              <UserBubble>
                AZ
              </UserBubble>
              <span className="user-username">
                DJAzium
              </span>
            </li>
          </ul>

          {
            this.state.savedPermission !== 'private'
            && (
              <div>
                <small>Link to share</small>
                <LinkShare />
              </div>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          { this.renderPermissions() }
        </Modal.Footer>
      </Modal>
    )
  }

  renderPermissions() {
    if (this.state.choosingPermissions) {
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

    let option = this.permissionsOptions.find(x => x.type === this.state.savedPermission)
    return (
      <div className="row" style={{ marginBottom: 0, textAlign: 'left' }}>
        <div className="col-xs-8">
          <PermissionsOption option={option} />
        </div>
        <div className="col-xs-4 text-right">
          <button className="btn btn-link link-primary" onClick={this.expandPermissions}>
            <span>Change </span>
            <span className="fa fa-sort" />
          </button>
        </div>
      </div>
    )
  }

  expandPermissions = () => {
    this.setState({
      choosingPermissions: true,
      selectedPermission: this.state.savedPermission,
    })
  }
  selectPermissions = (e) => {
    this.setState({ selectedPermission: e.currentTarget.value })
  }
  savePermissions = (e) => {
    this.setState({ savedPermission: this.state.selectedPermission })
    this.closePermissions(e)
  }
  closePermissions = (e) => {
    this.setState({ choosingPermissions: false })
    e.preventDefault()
  }


  closeModal = () => {
    this.props.dispatch(modalClose())
  }

}

export default connect()(PermissionsModal)
