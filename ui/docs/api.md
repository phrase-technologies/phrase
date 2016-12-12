### Developing your own plugins for Phrase

Want to make a cool instrument or effect for everyone to use? It's easy.

You need three files:

    yourPlugin/
      yourPlugin_Info.js
      yourPlugin_Graph.js
      yourPlugin_Interface.js

#### `Info`

  `id` *required -  Your unique plugin id*
  `description` *required -  What does this plugin do?*
  `settings` *required - an array with at least one config.. the first will load by default*


  example:

    export default {
      id: `Wobbler`,
      description: `Makes dirty wobblez..`
      settings: [{
        shape; `sine`,
        rate: 120,
      }]
    }


#### `Graph` class

    class WobblerSource {

      constructor (
        AudioContext,
        config
      )

      // Required

      connect(node)
      update(nextConfig)
      destroy()

      // Instrument

      fireNote(keyNum, velocity, time)
    }


#### `Interface ({ track, update }) =>`

  A function that returns the display of the plugin. Can call `update` to update the settings of the currently selected track's instance.

    function WobblerInterface ({ track, update }) {
      return (
        <WobblerSkin>
          <WobblerTitle />
          <button onClick={
            () => update({
              wobble: !track.instrument.config.wobble
            })
          }/>
        </WobblerSkin>
      )
    }

## Styling your plugin

  - full screen mode
  - responsive designs
  - ajax (images / fonts)


## Testing your plugin

  - survive a 'Phrase plugin' test?


_____

#### Random thoughts

 - 'gitter' style chatroom for every plugin?
