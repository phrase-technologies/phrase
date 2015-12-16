import React, { Component } from 'react';
import { connect } from 'react-redux';

import { layoutConsoleToggle,
         layoutConsoleSplit } from '../actions/actions.js';

import CursorProvider from './CursorProvider.js';
import LayoutPage from './LayoutPage.js';
import LayoutMixer from './LayoutMixer.js';
import LayoutSplit from './LayoutSplit.js';
import LayoutClip from './LayoutClip.js';

export default class Layout extends Component {

  constructor() {
    super();
    this.state = {
      page: 'B'
    };
  }

  renderPageOverlay() {
    var pageOverlayClasses = this.props.console
                           ? 'layout-page-overlay'
                           : 'layout-page-overlay layout-overlay-hidden';
    return (
      <div className={pageOverlayClasses} onClick={() => this.props.dispatch(layoutConsoleToggle())} />
    );
  }

  render() {
    return (
      <CursorProvider>
        <div className="layout disable-select">
          {/*
          <LayoutPage />
          */}
          <LayoutMixer splitRatio={this.props.consoleSplit} expanded={this.props.console} />
          <LayoutClip  splitRatio={this.props.consoleSplit} expanded={this.props.console} />
          <LayoutSplit splitRatio={this.props.consoleSplit} setRatio={(ratio) => this.props.dispatch(layoutConsoleSplit(ratio))} />
          {this.renderPageOverlay()}
        </div>
      </CursorProvider>
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
