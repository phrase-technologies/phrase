export const tryAnalyticsEvent = ({ eventName, ...payload }) => {
  if (analytics) {
    analytics.track(eventName, payload)
  }
}
export const tryAnalyticsIdentify = ({ userId, username, email }) => {
  if (analytics) {
    analytics.identify(userId, {
      name: username,
      email,
    })
  }
}
export default {
  event: tryAnalyticsEvent,
  identify: tryAnalyticsIdentify,
}
