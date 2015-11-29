import React, { Component } from 'react';
import { connect } from 'react-redux';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';
import EffectsModule from './EffectsModule.js';
import EffectsCoupler from './EffectsCoupler.js';
import { CURSOR_TYPES } from '../actions/actions.js';

export default class Layout extends Component {

  componentDidMount() {
    this.setState({trackToggle: 'clip'});
  }

  getCursorClass() {
    var resultClass = "";

    if( this.props.cursor.explicit )
      resultClass = "cursor-"+this.props.cursor.explicit;
    else if( this.props.cursor.implicit )
      resultClass = "cursor-"+this.props.cursor.implicit;

    return resultClass;
  }

  render() {
    var hidden = {display: 'none'};
    var layoutClasses = ["layout", this.getCursorClass(), 'disable-select'];
        layoutClasses = layoutClasses.join(' ').trim();
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  
    return (
      <div className={layoutClasses}>
        <div className="layout-header" style={hidden}>
          <img src={logo} />
        </div>
        <div className="layout-session">
          Session
        </div>
        <div className="layout-transport">
          <Transport />
        </div>
        <div className="layout-track">
          <div className="layout-track-slider">
            <EffectsCoupler />
            <EffectsModule name="Clip Editor">
              <PianoRoll/>
            </EffectsModule>
            <EffectsCoupler />
            <EffectsModule name="Super Saw" />
            <EffectsCoupler />
            <EffectsModule name="Reverb" />
            <EffectsCoupler />
            <EffectsModule name="Delay" />
            <EffectsCoupler />
          </div>
        </div>
        <div className="layout-editor">
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    cursor: state.cursor
  };
}

export default connect(mapStateToProps)(Layout);