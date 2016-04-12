import React, { Component } from 'react'
import Modal from 'react-bootstrap/lib/Modal'

export default class AuthenticationModal extends Component {
  render() {
    return (
      <Modal
        bsSize="small"
        show={true}
        onHide={this.closeModal}
      >
        <Modal.Body closeButton>
          <div className="form-group">
            <h4 className="text-center">Have an account?</h4>
          </div>
          <div className="form-group">
            <input className="form-control" type="email" placeholder="Email" />
          </div>
          <div className="form-group">
            <input className="form-control" type="password" placeholder="Password" />
          </div>
          <button className="btn btn-block btn-dark" type="submit">
            Log in
          </button>
          <br/>
          <p className="text-center">
            <span>New to Phrase? </span>
            <a><strong>Sign up</strong></a>
          </p>
        </Modal.Body>
      </Modal>
    )
  }

  closeModal() {
    // this.props.dispatch()
  }
}
