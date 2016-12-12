
export const isMacintosh = () => {
  return navigator.platform.indexOf('Mac') > -1
}

export const isIE = () => {
  return !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g)
}

export const isModifierOn = (e) => {
  if (isMacintosh())
    return e.metaKey
  return e.ctrlKey
}
