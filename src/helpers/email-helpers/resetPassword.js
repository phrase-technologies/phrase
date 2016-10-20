
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ username, email, resetToken }) => {
  let data = {
    user: { username },
    callToAction: {
      text: `Reset Password!`,
      href: `${clientURL}/new-password?token=${resetToken}&email=${email}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: `Phrase.fm - Reset your password`,
    template: `reset-password`,
    data,
  })
  return response
}
