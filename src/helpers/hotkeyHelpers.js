
export const isMacintosh = () => {
  return navigator.platform.indexOf('Mac') > -1
}

export const isModifierOn = (e) => {
  if (isMacintosh())
    return e.metaKey
  return e.ctrlKey
}
