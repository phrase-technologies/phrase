import React, { Component } from 'react';
import Transport from './Transport.js';

export default class Layout extends Component {
  render() {
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  

    return (
      <div className="layout">
        <div className="layout-header">
          <img src={logo} />
        </div>
        <div className="layout-body">
          <p>
            Some random test text!
          </p>
        </div>
        <div className="layout-footer">
          <Transport />
        </div>
      </div>
    );
  }
}
