import React, { Component } from 'react';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';

export default class Layout extends Component {
  render() {
    var hidden = { display: "none" };
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  
    return (
      <div className="layout">
        <div className="layout-header">
          <img src={logo} />
        </div>
        <div className="layout-body">
          <PianoRoll />
        </div>
        <div className="layout-footer" style={hidden}>
          <Transport />
        </div>
      </div>
    );
  }
}
