
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ email, author, token, phraseId }) => {
  let data = {
    headline: `${author.username} added you as a collaborator`,
    author,
    callToAction: {
      href: `${clientURL}/phrase/${author.username}/${phraseId}?invite-code=${token}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: data.headline,
    template: `invite-email-collaborator`,
    data,
  })
  return response
}
