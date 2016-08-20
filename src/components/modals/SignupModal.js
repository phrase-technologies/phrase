import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import isAValidEmail from 'helpers/isEmail'
import isValidUsername from 'helpers/isUsername'
import { signup } from 'reducers/reduceAuth'
import { modalOpen, modalClose } from 'reducers/reduceModal'

export class SignupModal extends Component {

  constructor() {
    super()
    this.state = {
      inviteCodeError: null,
      inviteCodePristine: true,
      emailError: null,
      emailPristine: true,
      usernameError: null,
      usernamePristine: true,
      passwordError: null,
      passwordPristine: true,
    }
  }

  render() {
    let inviteCodeGroupClass = 'form-group'
        inviteCodeGroupClass += !this.state.inviteCodePristine && this.state.inviteCodeError ? ' has-error' : ''
    let emailGroupClass = 'form-group'
        emailGroupClass += !this.state.emailPristine && this.state.emailError ? ' has-error' : ''
    let usernameGroupClass = 'form-group'
        usernameGroupClass += !this.state.usernamePristine && this.state.usernameError ? ' has-error' : ''
    let passwordGroupClass = 'form-group'
        passwordGroupClass += !this.state.passwordPristine && this.state.passwordError ? ' has-error' : ''
    let errorStyle = { fontSize: 12, marginTop: 3, lineHeight: 1 }

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
            <h4 className="text-center">Create an Account.</h4>
          </div>
          <form onSubmit={this.signup} noValidate>
            <div className={inviteCodeGroupClass} style={{marginBottom: 10}}>
              <div className="input-group">
                <span className="input-group-addon">
                  Invite Code
                </span>
                <input
                  className="form-control" type="text"
                  placeholder="Invite Code" ref={(ref) => this.inviteCode = ref}
                  onBlur={this.inviteCodeBlur} onKeyUp={this.inviteCodeValidate} defaultValue={this.props.inviteCode}
                />
              </div>
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.inviteCodeError}
              </p>
            </div>
            <div className={emailGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="email"
                placeholder="Email" ref={(ref) => this.email = ref}
                onBlur={this.emailBlur} onKeyUp={this.emailValidate}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.emailError}
              </p>
            </div>
            <div className={usernameGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="username"
                placeholder="Username" ref={(ref) => this.username = ref}
                onBlur={this.usernameBlur} onKeyUp={this.usernameValidate}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.usernameError}
              </p>
            </div>
            <div className={passwordGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="password"
                placeholder="Password" ref={(ref) => this.password = ref}
                onBlur={this.passwordBlur} onKeyUp={this.passwordValidate}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.passwordError}
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Sign up
            </LaddaButton>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <span>Already have an account? </span>
            <a href="" onClick={this.openLoginModal} onMouseDown={this.openLoginModal}>
              <strong>Log in</strong>
            </a>
          </p>
        </Modal.Footer>
      </ModalComponent>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errorMessage)
      this.setState(nextProps.errorMessage)
  }

  inviteCodeBlur = () => {
    this.setState({ inviteCodePristine: false }, () => {
      this.inviteCodeValidate()
      this.signup()
    })
  }
  inviteCodeValidate = () => {
    if (this.state.inviteCodePristine)
      return

    if (!this.inviteCode.value) {
      this.setState({ inviteCodeError: "Invite Code is required." })
      return false
    }
    this.setState({ inviteCodeError: null })
    return true
  }
  emailBlur = () => {
    this.setState({ emailPristine: false }, () => {
      this.emailValidate()
      this.signup()
    })
  }
  emailValidate = () => {
    if (this.state.emailPristine)
      return

    if (!this.email.value || !isAValidEmail(this.email.value)) {
      this.setState({ emailError: "Invalid email." })
      return false
    }
    this.setState({ emailError: null })
    return true
  }

  usernameBlur = () => {
    this.setState({ usernamePristine: false }, () => {
      this.usernameValidate()
    })
  }
  usernameValidate = () => {
    if (this.state.usernamePristine)
      return

    let trimmedUsername = this.username.value.trim()
    if (trimmedUsername.length < 3) {
      this.setState({ usernameError: "Usernames must be at least 3 characters long." })
      return false
    } else if (trimmedUsername.length > 21) {
      this.setState({ usernameError: "Usernames may be at most 21 characters long." })
      return false
    } else if (!isValidUsername(trimmedUsername)) {
      this.setState({ usernameError: "Usernames may only contain letters, numbers, and underscores." })
      return false
    }

    this.setState({ usernameError: null })
    return true
  }

  passwordBlur = () => {
    this.setState({ passwordPristine: false }, () => {
      this.passwordValidate()
    })
  }
  passwordValidate = () => {
    if (this.state.passwordPristine)
      return

    let trimmedPassword = this.password.value.trim()
    if (trimmedPassword.length < 6) {
      this.setState({ passwordError: "Passwords must be at least 6 characters long" })
      return false
    } else if (trimmedPassword.length > 64) {
      this.setState({ passwordError: "Passwords may be at most 64 characters long" })
      return false
    }

    this.setState({ passwordError: null })
    return true
  }

  signup = (e) => {
    e ? e.preventDefault() : null

    this.setState({
      inviteCodePristine: false,
      emailPristine: false,
      usernamePristine: false,
      passwordPristine: false,
    })

    this.props.dispatch(signup({
      inviteCode: this.inviteCode.value,
      email: this.email.value,
      username: this.username.value,
      password: this.password.value,
    }))
  }

  // Attach this to onMouseDown (in addition to onClick) to take
  // precedence over validaiton onBlur handlers
  openLoginModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'LoginModal' }))
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(SignupModal)
