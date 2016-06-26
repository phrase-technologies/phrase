import React from 'react'

let style = {
  container: {
    padding: `10px`,
    backgroundColor: `rgb(34, 101, 150)`,
    display: `flex`
  },
  title: {
    fontSize: `3rem`,
    fontWeight: 100,
    color: `rgb(61, 42, 59)`
  },
  button: {
    color: `rgb(34, 101, 150)`,
    border: `1px solid #ccc`,
    borderRadius: `20px`,
    margin: `5px`,
    padding: `4px 8px`,
    fontWeight: 300,
    fontSize: `14px`,
    cursor: `pointer`,
  }
}

let PollyInterface = ({ track, update }) => {
  return (
    <div id="Plugin__Polly" style={style.container}>
      <div style={style.title}>POLLY</div>
      <div style={{ display: `flex`, marginLeft: `auto` }}>
        { [ `sine`, `triangle`, `sawtooth`, `square`, ].map(oscillatorType =>
          <button
            key={oscillatorType}
            className={track.instrument.config.oscillatorType === oscillatorType ? `active` : ``}
            style={style.button}
            onClick={() => update({ ...track.instrument.config, oscillatorType })}
          >
            {oscillatorType.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  )
}

export default PollyInterface
