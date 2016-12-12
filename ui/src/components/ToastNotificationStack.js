import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NotificationStack } from 'react-notification'

import { dismissNotification } from 'reducers/reduceNotification'

export class ToastNotificationStack extends Component {

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

export default connect(state => state.notification)(ToastNotificationStack)
