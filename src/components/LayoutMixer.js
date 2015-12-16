import React, { Component } from 'react';
import { connect } from 'react-redux';

import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { layoutConsoleToggle,
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
      this.props.dispatch(layoutConsoleToggle());
  }

  render() {
    var layoutConsoleClasses = 'layout-mixer';
        layoutConsoleClasses += this.props.expanded ? '' : ' layout-mixer-collapsed';
    var splitRatio = {
      bottom: ((1 - this.props.ratio) * 100) + '%'
    };

    return (
      <div className={layoutConsoleClasses}
        onClick={this.handleToggleConsole}
        style={splitRatio}
      >
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

function mapStateToProps(state) {
  return {
    ratio: state.navigation.consoleSplit
  };
}

export default connect(mapStateToProps)(LayoutMixer);
