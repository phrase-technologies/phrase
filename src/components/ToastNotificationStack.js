import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NotificationStack } from 'react-notification'

import { dismissNotification } from '../reducers/reduceNotification'

export default class ToastNotificationStack extends Component {

  render() {
    return (
      <div className="toast-notifications">
        <NotificationStack
          notifications={this.props.notifications}
          onDismiss={notification => this.dismissNotificationHandler(notification.key)}
        />
      </div>
    )
  }

  dismissNotificationHandler = (key) => {
    this.props.dispatch(dismissNotification({ key }))
  }
}

function mapStateToProps(state) {
  return {
    ...state.notification
  }
}
export default connect(mapStateToProps)(ToastNotificationStack)
