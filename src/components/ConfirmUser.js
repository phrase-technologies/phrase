import React, { Component } from 'react'
import Helmet from "react-helmet"
import { connect } from 'react-redux'

import { confirmUser } from 'reducers/reduceAuth'
import { modalOpen } from 'reducers/reduceModal'

export class ConfirmUser extends Component {
  componentWillMount() {
    this.props.dispatch(confirmUser({
      email: this.props.location.query.email,
      confirmToken: this.props.location.query.token,
    }))
  }

  render = () => (
    <div>
      {this.props.showError &&
        <div className="confirm-user">
          <Helmet title={`Failed to Confirm - Phrase.fm`} />
          <div className="page-header">
            <h4 className="text-center">Looks like that link was invalid!</h4>
          </div>
          <div className="container text-center">
            <p>Please&nbsp;
              <a href='' onClick={this.openConfirmRetryModal}>
                <strong>click here</strong>
              </a>
              &nbsp;to try again
            </p>
          </div>
        </div>
      }

      {!this.props.showError &&
        <div className="page-header">
          <h4 className="text-center">Loading....</h4>
        </div>
      }
    </div>
  )

  openConfirmRetryModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({
      modalComponent: `ConfirmRetryModal`,
      payload: this.props.location.query.email,
    }))
  }
}

export default connect((state) => { return { showError: state.auth.showConfirmUserError } })(ConfirmUser)
