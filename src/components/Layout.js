import React, { Component } from 'react';
import Transport from './Transport.js';

export default class Layout extends Component {
  render() {
    return (
      <div className="layout">
        <div className="layout-header">
          <p>
            Some random test text!
          </p>
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
