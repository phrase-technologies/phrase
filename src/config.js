
let isProd = () => { return process.env.NODE_ENV === `production` }

export let secret = `i got 99 problemz but a DAW aint one`
export let clientURL = process.env.CLIENT_URL || `localhost:3000`
export let apiURL = isProd() ? `http://api.phrase.fm` : `http://dev-api.phrase.fm:5000`

export let sendInBlueApi = `https://api.sendinblue.com/v2.0`
export let sendInBlueKey = `j0mvfYGrb7ZEJdTy`

export let facebookAppID = isProd() ?
  `992813620834731` :
  `992816724167754`
export let facebookAppSecret = isProd() ?
  `a9edb37f4e18aa31d4c5d0b41edf5a24` :
  `4539c09f436b3dfeca6f1574ce2d0900`

export let googleAppID = isProd() ?
  `824442938754-vgnee5n6289d7ugtv9bndebsittjv215.apps.googleusercontent.com` :
  `96612606068-smbafu4j3cdle1fjtgt3nopm9l7009jd.apps.googleusercontent.com`
export let googleAppSecret = isProd() ?
  `x4TqOFs1p1R3dHmGLbLNq6n8` :
  `ZtB-78up4C72El69lJJwyKfj`

export let fileWhiteList = {
  [`/api/uploadTrackAudio`]: [`audioFile`],
}
