import { transport } from './actions.js'
import { audioPlay,
         audioStop } from '../audio/audio_TODO-RENAME.js'

export const transportPlay = () => {
  audioPlay()
  return {
    type: transport.PLAY
  }
}
export const transportStop = () => {
  audioStop()
  return {
    type: transport.STOP
  }
}
export const transportRecord              = ()        => ({type: transport.RECORD})
export const transportSetTempo            = ()        => ({type: transport.SET_TEMPO})
