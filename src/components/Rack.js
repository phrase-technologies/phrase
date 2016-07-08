import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'
import Plugins from 'plugins'
import { phraseUpdatePluginConfig } from 'reducers/reducePhrase'
import NewRibbon from 'components/NewRibbon'
import { modalOpen } from 'reducers/reduceModal'

function Rack ({ track, tempo, update, modalOpen }) {
  return (
    <div className="rack-container">
      <div className="rack-item">
        { track.rack.map((plugin, i) => {
          let PluginInterface = Plugins[plugin.id].Interface
          return (
            <PluginInterface
              key={`${plugin.id}-${i}`}
              config={plugin.config}
              update={_.partial(update, i)}
            />
          )
        })}
      </div>

      <NewRibbon
        handleClick={() => modalOpen({ modalComponent: `SearchModal` })}
        text=" Change Instrument / Add Plugin"
      />
    </div>
  )
}

function mapDispatchToProps(dispatch, { track: { id } }) {
  return {
    update: bindActionCreators(_.partial(phraseUpdatePluginConfig, id), dispatch),
    modalOpen: bindActionCreators(modalOpen, dispatch)
  }
}

export default connect(null, mapDispatchToProps)(Rack)
