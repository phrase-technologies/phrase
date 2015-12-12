import React, { Component } from 'react';
import { connect } from 'react-redux';

import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { navConsoleToggle,
         pianoRollScrollX } from '../actions/actions.js';

import MixerArrangement from './MixerArrangement.js';
import Transport from './Transport.js';

export default class LayoutMixer extends Component {

  constructor() {
    super();
    this.handleToggleConsole = this.handleToggleConsole.bind(this);
  }

  handleToggleConsole() {
    if( !this.props.expanded )
      this.props.dispatch(navConsoleToggle());
  }

  render() {
    var layoutConsoleClasses = 'layout-mixer';
        layoutConsoleClasses += this.props.expanded ? '' : ' layout-mixer-collapsed';

    return (
      <div className={layoutConsoleClasses} onClick={this.handleToggleConsole}>
        <Transport />
        <MixerArrangement
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          barCount={64}
          dispatch={this.props.dispatch}
        />
      </div>
    );
  }
}

export default connect()(LayoutMixer);
