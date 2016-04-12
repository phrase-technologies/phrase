import React, { Component } from 'react'
import Modal from 'react-bootstrap/lib/Modal'

export default class AuthenticationModal extends Component {
  render() {
    let mainHeading = this.props.returningUser ? 'Have an account?' : 'Join Phrase Today.'
    let mainButton = this.props.returningUser ? 'Log in' : 'Sign up'
    let alternateHeading = this.props.returningUser ? 'New to Phrase?' : 'Already have an account?'
    let alternateButton = this.props.returningUser ? 'Sign up' : 'Log in'

    return (
      <Modal
        bsSize="small"
        show={true}
        onHide={this.closeModal}
      >
        <Modal.Body>
          <button type="button" className="close">&times;</button>
          <div className="form-group">
            <h4 className="text-center">{mainHeading}</h4>
          </div>
          <div className="form-group">
            <input className="form-control" type="email" placeholder="Email" />
          </div>
          <div className="form-group">
            <input className="form-control" type="password" placeholder="Password" />
          </div>
          <button className="btn btn-block btn-dark" type="submit">
            {mainButton}
          </button>
          <br/>
          <p className="text-center">
            <span>{alternateHeading} </span>
            <a><strong>{alternateButton}</strong></a>
          </p>
        </Modal.Body>
      </Modal>
    )
  }

  closeModal() {
    // this.props.dispatch()
  }
}

AuthenticationModal.propTypes = {
  dispatch: React.PropTypes.func.isRequired
}
