import React, { Component } from 'react';

export default class StorySound extends Component {
  render() {
    return (
      <div className="story-sound">
        <span className="fa fa-wifi fa-rotate-90" />
        Sound
      </div>      
    );
  }
}

StorySound.propTypes = {
  name: React.PropTypes.string.isRequired,
  contributors: React.PropTypes.arrayOf(
                  React.PropTypes.shape({
                    userPhoto:  React.PropTypes.string.isRequired,
                    userName:   React.PropTypes.string.isRequired
                  })
                ),
};
