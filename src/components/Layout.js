import React, { Component } from 'react';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';

export default class Layout extends Component {
  render() {
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  

    var pianoRoll = armedForRecording ? <PianoRoll /> : null;

    return (
      <div className="layout">
        <div className="layout-header">
          <img src={logo} />
        </div>
        <div className="layout-body">
          {pianoRoll}
        </div>
        <div className="layout-footer">
          <Transport />
        </div>
      </div>
    );
  }
}
