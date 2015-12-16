import React, { Component } from 'react';
import { connect } from 'react-redux';
import PianoRoll from './PianoRoll.js';
import EffectsModule from './EffectsModule.js';
import EffectsCoupler from './EffectsCoupler.js';
import Stories from './Stories.js';
import LayoutPage from './LayoutPage.js';
import LayoutMixer from './LayoutMixer.js';
import LayoutSplit from './LayoutSplit.js';
import LayoutClip from './LayoutClip.js';
import { layoutConsoleToggle,
         layoutConsoleSplit } from '../actions/actions.js';

export default class Layout extends Component {

  constructor() {
    super();
    this.state = {
      page: 'B'
    };

    this.handleToggleConsole = this.handleToggleConsole.bind(this);
  }

  handleToggleConsole() {
    this.props.dispatch(layoutConsoleToggle());
  }

  getCursorClass() {
    var resultClass = "";

    if( this.props.cursor.explicit )
      resultClass = "cursor-"+this.props.cursor.explicit;
    else if( this.props.cursor.implicit )
      resultClass = "cursor-"+this.props.cursor.implicit;

    return resultClass;
  }

  renderPageOverlay() {
    var pageOverlayClasses = this.props.console
                           ? 'layout-page-overlay'
                           : 'layout-page-overlay layout-overlay-hidden';
    return (
      <div className={pageOverlayClasses} onClick={this.handleToggleConsole} />
    );
  }

  render() {
    var layoutClasses = ["layout", this.getCursorClass(), 'disable-select'];
        layoutClasses = layoutClasses.join(' ').trim();
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  


    return (
      <div className={layoutClasses}>
        <div className="layout">
          {/*
          <LayoutPage />
          */}
          <LayoutMixer splitRatio={this.props.consoleSplit} expanded={this.props.console} />
          <LayoutClip  splitRatio={this.props.consoleSplit} expanded={this.props.console} />
          <LayoutSplit splitRatio={this.props.consoleSplit} setRatio={(ratio) => this.props.dispatch(layoutConsoleSplit(ratio))} />
          {this.renderPageOverlay()}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    console: state.navigation.console,
    consoleSplit: state.navigation.consoleSplit,
    cursor: state.cursor
  };
}

export default connect(mapStateToProps)(Layout);
