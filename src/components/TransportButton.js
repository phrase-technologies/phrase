import React, { Component } from 'react';

export default class TransportButton extends Component {
  render() {
    var colorClass = ` ${this.props.color ? `active-${this.props.color}` : ""}`;
    var activeClass = ` ${this.props.toggle ? "active" : ""}`;
    var buttonClasses = `btn btn-link btn-glow ` + activeClass + colorClass;
    var iconClasses = `fa fa-${this.props.type}`;

    return (
      <button type="button" className={buttonClasses}
              onClick={this.props.onButtonClick}>
        <i className={iconClasses} />
      </button>
    );
  }
}