import React, { Component } from 'react';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';
import TestComponent from './TestComponent.js';

export default class Layout extends Component {
  render() {
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  
    var pianoRoll = true ? <PianoRoll /> : null
    return (
      <div className="layout">
        <div className="layout-header">
          <img src={logo} />
        </div>
        <div className="layout-body">
          {pianoRoll}
          <br/>
          <TestComponent shit={123} />          
        </div>
        <div className="layout-footer">
          <Transport />
        </div>
      </div>
    );
  }
}
