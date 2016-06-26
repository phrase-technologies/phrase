import React from 'react'

let style = {
  container: {
    height: `150px`,
    padding: `10px`,
    backgroundColor: `rgb(34, 101, 150)`,
  },
  title: {
    fontSize: `3rem`,
    fontWeight: 100,
  },
  button: {
    border: `1px solid #ccc`,
    borderRadius: `20px`,
    margin: `5px`,
    padding: `4px 8px`,
    fontWeight: 100,
    cursor: `pointer`,
  },
  buttonActive: {
    backgroundColor: `#ccc`,
    color: `rgb(34, 101, 150)`,
  }
}

let PollyInterface = ({ track, update }) => {
  return (
    <div style={style.container}>
      <div style={style.title}>POLLY</div>
      <div style={{ display: `flex` }}>
        { [ `sine`, `triangle`, `sawtooth`, `square`, ].map(oscillatorType =>
          <div
            key={oscillatorType}
            style={{
              ...style.button,
              ...(track.instrument.config.oscillatorType === oscillatorType ? style.buttonActive : {})
            }}
            onClick={() => update({ ...track.instrument.config, oscillatorType })}
          >
            {oscillatorType.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

export default PollyInterface
