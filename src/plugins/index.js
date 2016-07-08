import PollySource from './Polly/PollySource'
import PollyInterface from './Polly/PollyInterface'
import PollyMeta from './Polly/PollyMeta'
import SamplerSource from './Sampler/SamplerSource'
import SamplerInterface from './Sampler/SamplerInterface'
import SamplerMeta from './Sampler/SamplerMeta'
import PianoSource from './Piano/PianoSource'
import PianoInterface from './Piano/PianoInterface'
import PianoMeta from './Piano/PianoMeta'
import DelaySource from './Delay/DelaySource'
import DelayInterface from './Delay/DelayInterface'
import DelayMeta from './Delay/DelayMeta'

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
  Piano: {
    Source: PianoSource,
    Interface: PianoInterface,
    Meta: PianoMeta,
  },
  Delay: {
    Source: DelaySource,
    Interface: DelayInterface,
    Meta: DelayMeta,
  },
}
