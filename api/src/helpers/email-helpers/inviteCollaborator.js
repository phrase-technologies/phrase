
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ author, user, phraseId }) => {
  let data = {
    headline: `${author.username} added you as a collaborator`,
    user,
    author,
    callToAction: {
      href: `${clientURL}/phrase/${author.username}/${phraseId}`,
    },
  }
  let response = await sendHtmlEmail({
    email: user.email,
    subject: data.headline,
    template: `invite-collaborator`,
    data,
  })
  return response
}
