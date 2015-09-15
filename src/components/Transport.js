import React, { Component } from 'react';
import TransportButton from './TransportButton';

export default class Transport extends Component {
  render() {
    return (
      <div className="transport ">
        <div className="btn-group">
          <TransportButton type="fast-backward" />
          <TransportButton type="stop" />
          <TransportButton type="play" />
          <TransportButton type="circle" />
          <TransportButton type="refresh" />
        </div>        
      </div>
    );
  }
}
