import { layout } from './actions.js'

export const layoutConsoleEmbedded        = ()        => ({type: layout.CONSOLE_EMBED})
export const layoutConsoleSplit           = (ratio)   => ({type: layout.CONSOLE_SPLIT, ratio})
