import React, { Component } from 'react';
import { connect } from 'react-redux';

import EffectsModule from './EffectsModule.js';
import PianoRoll from './PianoRoll.js';

export default class LayoutTrack extends Component {

  constructor() {
    super();
    this.handleToggleConsole = this.handleToggleConsole.bind(this);
  }

  handleToggleConsole() {
    if( !this.props.expanded )
      this.props.dispatch(navConsoleToggle());
  }

  render() {
    return (
      <div className="layout-track">
        <div className="layout-track-slider">
          <ul className="effects-chain">
          </ul>
          <EffectsModule name="Piano Roll">
            <PianoRoll />
          </EffectsModule>
        </div>
      </div>
    );
  }
}

export default connect()(LayoutTrack);
