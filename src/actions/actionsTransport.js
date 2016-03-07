import { transport } from './actions.js'

export const transportPlayToggle          = ()        => ({type: transport.PLAY_TOGGLE})
export const transportStop                = ()        => ({type: transport.STOP})
export const transportRecord              = ()        => ({type: transport.RECORD})
export const transportSetTempo            = ()        => ({type: transport.SET_TEMPO})
