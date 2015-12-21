import React, { Component } from 'react';
import { connect } from 'react-redux';

import { layoutConsoleToggle,
         layoutConsoleSplit } from '../actions/actions.js';

import CursorProvider from './CursorProvider.js';
import LayoutPage from './LayoutPage.js';
import LayoutSplit from './LayoutSplit.js';
import MixerArrangement from './MixerArrangement.js';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';

export default class Layout extends Component {

  constructor() {
    super();
    this.handleConsoleSplitDrag = this.handleConsoleSplitDrag.bind(this);
  }

  render() {
    if( this.props.consoleSplit < 0.2 )
    {
      var mixerSplit = { height: 45 };
      var clipSplit  = { top:    45 };
    }
    else if( this.props.consoleSplit > 0.8 )
    {
      var mixerSplit = { bottom: 45 };
      var clipSplit  = { height: 45 };
    }
    else
    {
      var mixerSplit = { bottom: ((1 - this.props.consoleSplit) * 100) + '%' };
      var clipSplit  = { top:    (     this.props.consoleSplit  * 100) + '%' };
    }
  
    var layoutConsoleClasses = 'layout-console';
        layoutConsoleClasses += this.props.console ? '' : ' layout-console-embedded';

    return (
      <CursorProvider>
        <div className="disable-select">
          <div className={layoutConsoleClasses}>
            {/*
            <LayoutPage />
            */}
            <div className="layout-console-header">
              <Transport />
            </div>
            <div className="layout-console-body">
              <div className="layout-console-main">
                <div className="layout-console-mixer" style={mixerSplit}>
                  {this.renderMixer()}
                </div>
                <LayoutSplit splitRatio={this.props.consoleSplit} setRatio={this.handleConsoleSplitDrag} />
                <div className="layout-console-clip" style={clipSplit}>
                  {this.renderClip()}
                </div>
              </div>
              <div className="layout-console-effects-chain">
              </div>
            </div>
            {this.renderPageOverlay()}
          </div>
        </div>
      </CursorProvider>
    )
  }

  renderMixer() {
    if( this.props.consoleSplit < 0.2 )
    {
      return (
        <h2 className="layout-console-heading" onClick={() => this.handleConsoleSplitDrag(0.5)}>
          Arrangement
          <span className="fa fa-plus-square pull-right" />
        </h2>
      );
    }
    else
      return ( <MixerArrangement /> );
  }

  renderClip() {
    if( this.props.consoleSplit > 0.8 )
    {
      return (
        <h2 className="layout-console-heading" onClick={() => this.handleConsoleSplitDrag(0.5)}>
          Clip Editor
          <span className="fa fa-plus-square pull-right" />
        </h2>
      );
    }
    else
      return ( <PianoRoll /> );
  }

  renderPageOverlay() {
    var pageOverlayClasses = this.props.console
                           ? 'layout-page-overlay'
                           : 'layout-page-overlay layout-overlay-hidden';
    return (
      <div className={pageOverlayClasses} onClick={() => this.props.dispatch(layoutConsoleToggle())} />
    );
  }

  handleConsoleSplitDrag(ratio) {
    this.props.dispatch(layoutConsoleSplit(ratio));
    window.dispatchEvent(new Event('resize'));
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
