
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ username, email, resetToken }) => {
  let data = {
    headline: `Reset your password`,
    user: { username },
    callToAction: {
      href: `${clientURL}/new-password?token=${resetToken}&email=${email}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: data.headline,
    template: `reset-password`,
    data,
  })
  return response
}
