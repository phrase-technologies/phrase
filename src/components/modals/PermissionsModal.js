import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import PermissionsOption from 'components/PermissionsOption'
import LinkShare from 'components/LinkShare'
import { modalClose } from 'reducers/reduceModal.js'

export class PermissionsModal extends Component {

  constructor() {
    super()
    this.state = {
      permission: "private",
      choosingPermissions: false,
    }
  }

  permissionsOptions = [
    {
      type: "private",
      title: "Private Access",
      description: "Only invited collaborators can access this session",
      icon: "lock",
      iconSize: 1,
    },
    {
      type: "link",
      title: "Link-only Access",
      description: "Anyone with the link can access this session",
      icon: "link",
      iconSize: 1,
    },
    {
      type: "public",
      title: "Public Access",
      description: "Anyone can access this session",
      icon: "globe",
      iconSize: 2,
    },
  ]

  render() {
    return (
      <Modal show={this.props.show} onHide={this.closeModal}>
        <Modal.Body>
          { this.renderPermissions() }
        </Modal.Body>
        <Modal.Body>
          <label>
            Share the link to your session
          </label>
          <LinkShare />
        </Modal.Body>
        <Modal.Body>
          <div className="form-group" style={{marginBottom: 10}}>
            <label htmlFor="collaborator-input">
              Invite Collaborators
            </label>
            <input id="collaborator-input"
              className="form-control" type="text"
              placeholder="Email or Username" ref={(ref) => this.email = ref}
            />
          </div>
          <div className="text-right">
            <LaddaButton
              className="btn btn-dark btn-sm" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Done
            </LaddaButton>
          </div>
        </Modal.Body>
      </Modal>
    )
  }

  renderPermissions() {
    if (this.state.choosingPermissions) {
      return (
        <form>
          {
            this.permissionsOptions.map((option, index) => {
              return (
                <div className="radio" key={index}>
                  <label>
                    <input
                      type="radio" name="permission_option"
                      value={option.type}
                      style={{ marginTop: 12 }}
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
          >
            Save
          </button>
          <button
            type="submit" className="btn btn-bright btn-sm"
            style={{ position: 'absolute', right: 15, bottom: 15, width: 80 }}
          >
            Cancel
          </button>
        </form>
      )
    }

    let option = this.permissionsOptions.find(x => x.type === this.state.permission)
    return (
      <div className="row">
        <div className="col-xs-9">
          <PermissionsOption option={option} />
        </div>
        <div className="col-xs-3 text-right">
          <button className="btn btn-link link-primary" onClick={this.choosePermissions}>
            <span>Change </span>
            <span className="fa fa-sort" />
          </button>
        </div>
      </div>
    )
  }

  choosePermissions = () => {
    this.setState({ choosingPermissions: true })
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

}

export default connect()(PermissionsModal)
