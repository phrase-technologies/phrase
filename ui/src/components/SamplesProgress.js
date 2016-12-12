import React from 'react'

const SamplesProgress = ({ samples }) =>
  (samples[0] &&
  samples[0].samplesLoaded < samples[0].totalSamples) ?
    <div className="workstation-samples-progress">
      {samples[0].samplesLoaded} / {samples[0].totalSamples}
    </div>
  : null

export default SamplesProgress
