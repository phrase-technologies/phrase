import React, { Component } from 'react'
import Helmet from "react-helmet"
import { connect } from 'react-redux'
import { confirmUser } from 'reducers/reduceAuth'

export class ConfirmUser extends Component {
  componentWillMount() {
    this.props.dispatch(confirmUser({
      email: this.props.location.query.email,
      confirmToken: this.props.location.query.token,
    }))
  }

  render = () => {
    let errorBody = (
      <div className="confirm-user">
        <Helmet title={`Failed to Confirm - Phrase.fm`} />
        <div className="page-header">
          <h4 className="text-center">Looks like that link was invalid!</h4>
        </div>
        <div className="container text-center">
          <p>TODO: Add functionality of what user is supposed to do!</p>
        </div>
      </div>
    )
    if (this.props.showError) return errorBody
    return <div></div>
  }
}

export default connect((state) => { return { showError: state.auth.showConfirmUserError } })(ConfirmUser)
