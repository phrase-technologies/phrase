
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ email, authorUsername, username, phraseId }) => {
  let data = {
    headline: `${username} rephrased your phrase`,
    user: { username: authorUsername },
    rePhraser: { username },
    callToAction: {
      href: `${clientURL}/phrase/${username}/${phraseId}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: data.headline,
    template: `rephrase`,
    data,
  })
  return response
}
