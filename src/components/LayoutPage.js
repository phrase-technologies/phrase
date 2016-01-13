import React, { Component } from 'react';
import { connect } from 'react-redux';

import Stories from './Stories.js';

export default class LayoutPage extends Component {
  render() {
    return (
      <div className="layout-page">
        <div className="layout-page-header">

          <h1>Stories</h1>
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
    );
  }
}

function mapStateToProps(state) {
  return {
    barMin: state.pianoroll.barMin,
    barMax: state.pianoroll.barMax
  };
}

export default connect(mapStateToProps)(LayoutPage);
