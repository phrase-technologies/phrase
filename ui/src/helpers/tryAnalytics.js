export const tryAnalyticsPage = () => {
  try {
    if (window.analytics) {
      window.analytics.page()
    }
  }
  catch(e) {
    console.log(e)
  }
}
export const tryAnalyticsEvent = ({ eventName, ...payload }) => {
  try {
    if (window.analytics) {
      window.analytics.track(eventName, payload)
    }
  }
  catch(e) {
    console.log(e)
  }
}
export const tryAnalyticsIdentify = ({ userId, username, email }) => {
  try {
    if (window.analytics) {
      window.analytics.identify(userId, {
        name: username,
        email,
      })
    }
  }
  catch(e) {
    console.log(e)
  }
}
export default {
  event: tryAnalyticsEvent,
  identify: tryAnalyticsIdentify,
}
