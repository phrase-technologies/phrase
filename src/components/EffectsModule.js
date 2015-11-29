import React, { Component } from 'react';

export default class EffectsModule extends Component {

  constructor() {
    super();
    this.state = {
      collapsed: false
    }
  }

  handleToggle(e) {
    this.setState({collapsed: !this.state.collapsed});
  }

  render() {
    var collapsedClass = this.state.collapsed ? ' collapsed' : '';
    var toggleClasses = ' fa ';
        toggleClasses += this.state.collapsed ? 'fa-plus-square-o' : 'fa-minus-square-o';

    return (
      <div className={'effects-module'+collapsedClass}>
        <div className="effects-module-header">
          <h1>
            {this.props.name}
            <span className="caret"/>
          </h1>
          <span className={'effects-module-toggle'+toggleClasses} onClick={this.handleToggle.bind(this)} />
        </div>
        <div className="effects-module-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}
