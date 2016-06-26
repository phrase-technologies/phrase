import PollySource from './Polly/PollySource'
import PollyInterface from './Polly/PollyInterface'
import SamplerSource from './Sampler/SamplerSource'
import SamplerInterface from './Sampler/SamplerInterface'

export default {
  Polly: {
    Source: PollySource,
    Interface: PollyInterface
  },
  Sampler: {
    Source: SamplerSource,
    Interface: SamplerInterface
  },
}
