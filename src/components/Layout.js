import React, { Component } from 'react';
import { connect } from 'react-redux';
import Transport from './Transport.js';
import PianoRoll from './PianoRoll.js';
import EffectsModule from './EffectsModule.js';
import EffectsCoupler from './EffectsCoupler.js';
import Stories from './Stories.js';
import { CURSOR_TYPES } from '../actions/actions.js';

export default class Layout extends Component {

  constructor() {
    super();
    this.state = {
      page: 'B'
    }
  }

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

  togglePage(page) {
    this.setState({page: page});
  }

  render() {
    var hidden = {display: 'none'};
    var layoutClasses = ["layout", this.getCursorClass(), 'disable-select'];
        layoutClasses = layoutClasses.join(' ').trim();
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  

    var pageA = (
      <div>
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

    var pageB = (
      <div>
        <div className="layout-page">
          <div className="layout-page-header">

            <h1>Browse Phrases</h1>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search for..." />
              <div className="input-group-btn">
                <button className="btn btn-default" type="button">
                  <span>Electronic </span>
                  <span className="caret"></span>
                </button>
                <button className="btn btn-default" type="button">
                  <span className="fa fa-search"></span>
                </button>
              </div>
            </div>

          </div>
          <div className="layout-page-body">

            <div className="layout-page-sidebar">
              <ul className="list-group">
                <li className="list-group-item">
                  <span className="fa fa-fw fa-globe"/>
                  <span> Overview</span>
                </li>
                <li className="list-group-item">
                  <span className="fa fa-fw fa-star"/>
                  <span> Favourites</span>
                </li>
              </ul>
            </div>

            <Stories />

          </div>
        </div>
        <div className="layout-console">
        </div>
      </div>
    );

    switch( this.state.page )
    {
      default:
      case 'A': var selectedPage = pageA; break;
      case 'B': var selectedPage = pageB; break;
    }

    return (
      <div className={layoutClasses}>
        <div className="layout-switch">
          <a onClick={this.togglePage.bind(this, 'A')}>A</a>
          <a onClick={this.togglePage.bind(this, 'B')}>B</a>
        </div>
        {selectedPage}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    cursor: state.cursor
  };
}

export default connect(mapStateToProps)(Layout);
