import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import withSocket from 'components/withSocket'
import { login, makeOAuthRequest, oAuthCallback } from 'reducers/reduceAuth'
import { modalOpen, modalClose } from 'reducers/reduceModal'

export class LoginModal extends Component {
  state = {
    errorMessage: null,
  }

  componentDidMount() {
    this.props.socket.on(`server::oAuthUser`, this.receiveSocketOAuth)
  }

  componentWillUnmount() {
    this.props.socket.off("server::oAuthUser", this.receiveSocketOAuth)
  }

  render() {
    let ModalComponent
    let modalProps
    if (this.props.embedded) {
      ModalComponent = 'div'
      modalProps = {
        className: 'modal-content',
      }
    } else {
      ModalComponent = Modal
      modalProps = {
        bsSize: "small",
        show: this.props.show,
        onHide: this.closeModal,
      }
    }
    return (
      <ModalComponent {...modalProps}>
        <Modal.Body>
          { !this.props.embedded && <button type="button" className="close" onClick={this.closeModal}>&times;</button> }
          <div className="form-group">
            <h4 className="text-center">Have an account?</h4>
          </div>
          <div className="form-group">
            <button className="btn btn-sm btn-dark btn-block btn-facebook" onClick={this.facebookOAuth}>
              <span className="fa fa-fw fa-facebook" />Login with Facebook
            </button>
            <button className="btn btn-sm btn-dark btn-block btn-google" onClick={this.googleOAuth}>
              <span className="fa fa-fw fa-google" /> Login with Google
            </button>
          </div>
          <form onSubmit={this.login} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="email" autoComplete
                placeholder="Email or Username" ref={(ref) => this.email = ref}
              />
            </div>
            <div className="form-group">
              <input
                className="form-control" type="password"
                placeholder="Password" ref={(ref) => this.password = ref}
              />
              <p className="text-right">
                <a href="" onClick={this.openForgotPasswordModal}><small>Forgot Password</small></a>
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Log in
            </LaddaButton>
            <p className="text-danger text-center" style={{ marginTop: 5, marginBottom: 0 }}>
              { this.state.errorMessage }
              { this.props.passwordFail && <a href="" onClick={this.openForgotPasswordModal}>set one here</a> }
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
      </ModalComponent>
    )
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.activeModal || nextProps.activeModal === 'LoginModal'
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errorMessage) {
      if(nextProps.errorMessage.oAuthError)
        this.setState({ errorMessage: nextProps.errorMessage.oAuthError })
      else
        this.setState({ errorMessage: nextProps.errorMessage })
    }
  }

  login = (e) => {
    e.preventDefault()

    this.props.dispatch(login({
      email: this.email.value,
      password: this.password.value,
    }))
  }

  facebookOAuth = (e) => {
    e.preventDefault()
    this.props.dispatch(makeOAuthRequest({ oAuth: `Facebook` }))
  }

  googleOAuth = (e) => {
    e.preventDefault()
    this.props.dispatch(makeOAuthRequest({ oAuth: `Google` }))
  }

  receiveSocketOAuth = (user) => {
    this.props.dispatch(oAuthCallback(user))
  }

  openSignupModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'SignupModal'  }))
  }

  openForgotPasswordModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'ForgotPasswordModal' }))
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

}

function mapStateToProps(state) {
  return {
    activeModal: state.modal.activeModal,
    ...state.auth,
  }
}

export default withSocket(connect(mapStateToProps)(LoginModal))
