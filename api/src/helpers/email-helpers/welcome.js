
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ email, username, confirmToken }) => {
  let data = {
    headline: `Activate your account on Phrase.fm`,
    user: { username },
    confirmToken,
    callToAction: {
      href: `${clientURL}/confirm-user?token=${confirmToken}&email=${email}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: data.headline,
    template: `welcome`,
    data,
  })
  return response
}
