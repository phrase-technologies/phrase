import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from "react-helmet"
import LaddaButton from 'react-ladda'

import { newPassword } from '../reducers/reduceAuth.js'
import { modalOpen } from '../reducers/reduceModal.js'

export class NewPassword extends Component {
  componentWillMount() {
    this.state = {
      emailError: null,
      passwordError: null,
      confirmPasswordError: null,
      resetToken: this.props.location.query.token,
      email: this.props.location.query.email
    }
  }

  render = () => {
    let passwordGroupClass = `form-group ${this.state.passwordError ? ' has-error' : ''}`
    let confirmPasswordGroupClass = `form-group ${this.state.confirmPasswordError ? ' has-error' : ''}`
    let errorStyle = { fontSize: 12, marginTop: 3, lineHeight: 1 }

    return (
      <div className="new-password">
        <Helmet title={`New Password - Phrase.fm`} />
        <div className="new-password-header page-header">
          <div className="form-group">
            <h4 className="text-center">Set a new password</h4>
          </div>
        </div>
        <div className="container col-md-4 col-md-offset-4">
          <form onSubmit={this.submit} noValidate>
            <div className={passwordGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="password"
                placeholder="Password" ref={(ref) => this.password = ref}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.passwordError}
              </p>
            </div>
            <div className={confirmPasswordGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="password"
                placeholder="Confirm Password" ref={(ref) => this.confirmPassword = ref}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.confirmPasswordError}
              </p>
            </div>
            <p className="text-danger text-right" style={errorStyle}>
              {this.state.emailError}
              {this.state.emailError && <a href={this.openForgotPasswordModal}>try again</a>}
            </p>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Save Password
            </LaddaButton>
          </form>
        </div>
      </div>
    )
  }

  submit = (e) => {
    e.preventDefault()

    this.props.dispatch(newPassword({
      email: this.state.email,
      resetToken: this.state.resetToken,
      password: this.password.value,
      confirmPassword: this.confirmPassword.value
    }))
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ emailError: null, passwordError: null, confirmPasswordError: null })
    if (nextProps.errorMessage)
      this.setState(nextProps.errorMessage)
  }

  openForgotPasswordModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'ForgotPasswordModal'  }))
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(NewPassword)
