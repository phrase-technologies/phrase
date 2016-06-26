import PollySource from './Polly/PollySource'
import PollyInterface from './Polly/PollyInterface'
import PollyMeta from './Polly/PollyMeta'
import SamplerSource from './Sampler/SamplerSource'
import SamplerInterface from './Sampler/SamplerInterface'
import SamplerMeta from './Sampler/SamplerMeta'

export default {
  Polly: {
    Source: PollySource,
    Interface: PollyInterface,
    Meta: PollyMeta,
  },
  Sampler: {
    Source: SamplerSource,
    Interface: SamplerInterface,
    Meta: SamplerMeta,
  },
}
