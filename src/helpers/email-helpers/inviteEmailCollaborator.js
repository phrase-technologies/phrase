
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ email, author, token, phraseId }) => {
  let data = {
    author,
    inviteCode: token,
    callToAction: {
      text: `Get Started!`,
      href: `${clientURL}/phrase/${author.username}/${phraseId}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: `Phrase.fm - Invite to collaborate!`,
    template: `invite-email-collaborator`,
    data,
  })
  return response
}
