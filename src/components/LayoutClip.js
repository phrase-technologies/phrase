import React, { Component } from 'react';

import EffectsModule from './EffectsModule.js';
import PianoRoll from './PianoRoll.js';

export default class LayoutClip extends Component {

  constructor() {
    super();
    //this.handleToggleConsole = this.handleToggleConsole.bind(this);
  }

  render() {
    var splitRatio = {
      top: (this.props.splitRatio * 100) + '%'
    };

    return (
      <div className="layout-clip" style={splitRatio}>
        {/*}
        <ul className="effects-chain">
        </ul>
        */}
        <PianoRoll />
      </div>
    );
  }
}

LayoutClip.propTypes = {
  splitRatio: React.PropTypes.number.isRequired
};
