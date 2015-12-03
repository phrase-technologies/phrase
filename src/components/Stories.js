import React, { Component } from 'react';
import _ from 'lodash';
import Story from './Story.js';

export default class StorySound extends Component {
  render() {

    var storiesComponents = [];
    for(var i in stories) {
      var story = stories[i];
      storiesComponents.push(
        <Story
          userPhoto={story.user.userPhoto}
          userName={story.user.userName}
          action={story.action}
          timestamp={story.timestamp}
          trackCover={story.item.trackCover}
          trackName={story.item.trackName}
          contributors={story.item.contributors}
          plays={story.item.plays}
          likes={story.item.likes}
          comments={story.item.comments}
          key={i}>
        </Story>
      );
    }

    return (
      <ul className="stories">
        {storiesComponents}
      </ul>
    );
  }
}

StorySound.propTypes = {
};


function getById(id){
  return function(element) {
    return element.id == id;
  }
}

var photos = [
  "anson-kao.jpg",
  "armin-intense.jpg",
  "armin.jpg",
  "chronic-2001.jpg",
  "dark-knight.jpg",
  "darth-raver.jpg",
  "deadmau5.jpg",
  "dr-dre.jpg",
  "eminem-black-white.jpg",
  "eminem-box.jpg",
  "eminem-chin.jpg",
  "eminem-vibe.jpg",
  "eminem.jpg",
  "game-of-thrones.jpg",
  "joker.jpg",
  "live-mau5.jpg",
  "meowingtons.jpg",
  "old-dude.jpg",
  "piano-keys.jpg",
  "piano.jpg",
  "porter-worlds.jpg",
  "porter.jpg",
  "random-album.jpg",
  "sax-collosus.jpg",
  "saxophone.jpg",
  "some-chords.jpg",
  "stuffed-mau5.jpg",
  "way-you-lie.png"
].sort(function(){
  // Randomize the order of photos (weakly, see http://stackoverflow.com/a/18650169/476426)
  return .5 - Math.random();
});

var users = [
  {
    id:           1,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "Eminem"
  },
  {
    id:           2,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "anson_kao"
  },
  {
    id:           3,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "Revolvr"
  },
  {
    id:           4,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "CRAZYDN"
  },
  {
    id:           5,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "MarkZou87"
  },
  {
    id:           6,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "Alesso"
  },
  {
    id:           7,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "Bobby Schmurda"
  },
  {
    id:           8,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "Andrew Rayel"
  },
  {
    id:           9,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "ARMIN VAN BUUREN"
  },
  {
    id:           10,
    userPhoto:    require('../img/user/'+photos.shift()),
    userName:     "b3li3b3r"
  }
];


var tracks = [
  {
    id:           1,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Love the way you lie",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        113585,
    likes:        6548,
    comments:     126    
  },
  {
    id:           2,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Terrorist Countdown",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        2975258,
    likes:        348008,
    comments:     28099
  },
  {
    id:           3,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Synthphony",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        8447,
    likes:        846,
    comments:     19
  },
  {
    id:           4,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Autumn Leaves",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        573,
    likes:        3,
    comments:     0
  },
  {
    id:           5,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Awaken From The Ruins",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        67,
    likes:        4,
    comments:     1
  },
  {
    id:           6,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "If I Lose Myself (Original Mix)",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        401975,
    likes:        810,
    comments:     84
  },
  {
    id:           7,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Hot N*gga",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        113585,
    likes:        6548,
    comments:     126
  },
  {
    id:           8,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Find Your Harmony Radioshow #003",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        74064,
    likes:        4540,
    comments:     213
  },
  {
    id:           9,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "A STATE OF TRANCE 950",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        984048,
    likes:        3257,
    comments:     0
  },
  {
    id:           10,
    trackCover:   require('../img/user/'+photos.shift()),
    trackName:    "Some crap that no-one wants",
    contributors: _.sample(users, Math.ceil(5*Math.random())),
    plays:        13,
    likes:        0,
    comments:     0
  }
];

var stories = [
  {
    user:         users.find(getById(1)),
    action:       "rephrased",
    timestamp:    new Date( (new Date()).getTime() - 10000000*Math.random()),
    item:         tracks.find(getById(1))
  },
  {
    user:         users.find(getById(2)),
    action:       "edited",
    timestamp:    new Date( (new Date()).getTime() - 10000000*Math.random()),
    item:         tracks.find(getById(2))
  },
  {
    user:         users.find(getById(3)),
    action:       "commented on",
    timestamp:    new Date( (new Date()).getTime() - 100000000*Math.random()),
    item:         tracks.find(getById(3))
  },
  {
    user:         users.find(getById(4)),
    action:       "published",
    timestamp:    new Date( (new Date()).getTime() - 10000000*Math.random()),
    item:         tracks.find(getById(4))
  },
  {
    user:         users.find(getById(5)),
    action:       "commented on",
    timestamp:    new Date( (new Date()).getTime() - 100000000*Math.random()),
    item:         tracks.find(getById(5))
  },
  {
    user:         users.find(getById(6)),
    action:       "rephrased",
    timestamp:    new Date( (new Date()).getTime() - 100000000*Math.random()),
    item:         tracks.find(getById(6))
  },
  {
    user:         users.find(getById(7)),
    action:       "commented on",
    timestamp:    new Date( (new Date()).getTime() - 1000000000*Math.random()),
    item:         tracks.find(getById(7))
  },
  {
    user:         users.find(getById(8)),
    action:       "commented on",
    timestamp:    new Date( (new Date()).getTime() - 1000000000*Math.random()),
    item:         tracks.find(getById(8))
  },
  {
    user:         users.find(getById(9)),
    action:       "commented on",
    timestamp:    new Date( (new Date()).getTime() - 1000000000*Math.random()),
    item:         tracks.find(getById(9))
  },
  {
    user:         users.find(getById(10)),
    action:       "commented on",
    timestamp:    new Date( (new Date()).getTime() - 1000000000*Math.random()),
    item:         tracks.find(getById(10))
  }
];
