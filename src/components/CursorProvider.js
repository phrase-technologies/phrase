import React, { Component } from 'react'
import { connect } from 'react-redux'

// ============================================================================
// Cursor Provider
// ============================================================================
// Special provider component which you should wrap your entire app with.
// Provides global cursor icon handling (since cursors are cascading)
//
// There are two priority levels provided for these cursors:
// - Implicit, generally for use on hover
// - Explicit, generally for use on drag&drop
//
export default class CursorProvider extends Component {

  getCursorClass() {
    var resultClass = ''

    if( this.props.cursor.explicit || this.props.cursor.implicit )
      resultClass = 'cursor-'+(this.props.cursor.explicit || this.props.cursor.implicit)

    return resultClass
  }

  render() {
    return (
      <div className={this.getCursorClass()}>
        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    cursor: state.cursor
  }
}

export default connect(mapStateToProps)(CursorProvider)
