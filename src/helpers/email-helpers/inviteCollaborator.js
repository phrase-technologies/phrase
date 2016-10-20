
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ author, user, phraseId }) => {
  let data = {
    user,
    author,
    callToAction: {
      text: `Check out the Phrase!`,
      href: `${clientURL}/phrase/${author.username}/${phraseId}`,
    },
  }
  let response = await sendHtmlEmail({
    email: user.email,
    subject: `Phrase.fm - Invite to collaborate!`,
    template: `invite-collaborator`,
    data,
  })
  return response
}
