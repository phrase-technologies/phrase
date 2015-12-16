import React, { Component } from 'react';
import { connect } from 'react-redux';

// ============================================================================
// Cursor Provider
// ============================================================================
// Special provider component which you should wrap your entire app with.
// Provides global cursor icon handling (since cursors are cascading)
export default class CursorProvider extends Component {

  getCursorClass() {
    var resultClass = "";

    if( this.props.cursor.explicit )
      resultClass = "cursor-"+this.props.cursor.explicit;
    else if( this.props.cursor.implicit )
      resultClass = "cursor-"+this.props.cursor.implicit;

    return resultClass;
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
  };
}

export default connect(mapStateToProps)(CursorProvider);
