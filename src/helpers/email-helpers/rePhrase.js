
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ email, authorUsername, username, phraseId }) => {
  let data = {
    user: { username: authorUsername },
    rePhraser: { username },
    callToAction: {
      text: `Check out the Phrase!`,
      href: `${clientURL}/phrase/${username}/${phraseId}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: `Phrase.fm - Rephrase Notification`,
    template: `rephrase`,
    data,
  })
  return response
}
