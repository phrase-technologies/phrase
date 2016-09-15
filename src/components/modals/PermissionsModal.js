import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import { MenuItem } from 'react-bootstrap'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import LaddaButton from 'react-ladda'

import { modalClose } from 'reducers/reduceModal.js'

export class PermissionsModal extends Component {

  render() {
    let permissionsOptions = [
      {
        type: "private",
        title: "Private Access",
        description: "Only invited collaborators can access this session",
        icon: "lock",
      },
      {
        type: "link",
        title: "Link-only Access",
        description: "Anyone with the link can access this session",
        icon: "link",
      },
      {
        type: "public",
        title: "Public Access",
        description: "Anyone can access this session",
        icon: "globe",
      },
    ]

    return (
      <Modal show={this.props.show} onHide={this.closeModal}>
        <Modal.Body>
          <Dropdown id="permissions-dropdown">
            <button className="dropdown-toggle btn btn-bright" bsRole="toggle">
              <span className="fa fa-lock" />
              <span> Only invited collaborators can access this session </span>
              <span className="caret" />
            </button>
            <Dropdown.Menu>
              {
                permissionsOptions.map((option, index) => {
                  return (
                    <MenuItem eventKey={option.type} key={index}>
                      <div className="media">
                        <div className="media-left" style={{ paddingRight: 5 }}>
                          <div className="media-object">
                            <span className="fa-stack fa-lg">
                              <span className="fa fa-circle-thin fa-stack-2x" />
                              <span className={`fa fa-{option.icon} fa-stack-1x`} />
                            </span>
                          </div>
                        </div>
                        <div className="media-body">
                          <h4 className="media-heading" style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>
                            { option.title }
                          </h4>
                          <small>
                            { option.description }
                          </small>
                        </div>
                      </div>
                    </MenuItem>
                  )
                }).reduce((acc, cur) => {
                  return [...acc, <MenuItem divider key={`{index}.divider`} />, cur]
                }, [])
              }
            </Dropdown.Menu>
          </Dropdown>

        </Modal.Body>
        <Modal.Body>
          {/*
          <button type="button" className="close" onClick={this.closeModal}>&times;</button>
          */}
          <form onSubmit={this.login} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="email" autoComplete
                placeholder="Email or Username" ref={(ref) => this.email = ref}
              />
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Log in
            </LaddaButton>
            <p className="text-danger text-center" style={{ marginTop: 5, marginBottom: 0 }}>
              { this.props.errorMessage }
              { this.props.confirmFail && <a href="" onClick={this.openSignupConfirmationModal}>confirm here</a> }
            </p>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <span>New to Phrase? </span>
            <a href="" onClick={this.openSignupModal}>
              <strong>Sign up</strong>
            </a>
          </p>
        </Modal.Footer>
      </Modal>
    )
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

}

export default connect()(PermissionsModal)
