import React, { Component } from 'react';
import { connect } from 'react-redux';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';
import { CURSOR_TYPES } from '../actions/actions.js';

export default class Layout extends Component {
  getCursorClass() {
    var resultClass = "";

    if( this.props.cursor.explicit )
      resultClass = "cursor-"+this.props.cursor.explicit;
    else if( this.props.cursor.implicit )
      resultClass = "cursor-"+this.props.cursor.implicit;

    return resultClass;
  }

  render() {
    var layoutClasses = ["layout", this.getCursorClass(), 'disable-select'];
        layoutClasses = layoutClasses.join(' ').trim();
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  
    return (
      <div className={layoutClasses}>
        <div className="layout-header">
          <img src={logo} />
        </div>
        <div className="layout-body">
          <PianoRoll />
        </div>
        <div className="layout-footer">
          <Transport />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    cursor: state.cursor
  };
}

export default connect(mapStateToProps)(Layout);