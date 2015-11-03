import React, { Component } from 'react';

export default class TestComponent extends Component {
  render() {
    return (
      <form>
        <h1>Test Component</h1>
        <p>{this.props.shit}</p>
      </form>
    );
  }
}

TestComponent.propTypes = {
  shit: React.PropTypes.oneOf([123, 456]).isRequired,
};
TestComponent.defaultProps = {
  shit: 0
};
