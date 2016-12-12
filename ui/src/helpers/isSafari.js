// http://stackoverflow.com/questions/7944460/detect-safari-browser/23522755#23522755
export default () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
