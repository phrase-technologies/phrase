
import { sendHtmlEmail } from '../sendInBlue'
import { clientURL } from '../../config'

export default async ({ email, username, confirmToken }) => {
  let data = {
    user: { username },
    confirmToken,
    callToAction: {
      text: `Confirm Here!`,
      href: `${clientURL}/confirm-user?token=${confirmToken}&email=${email}`,
    },
  }
  let response = await sendHtmlEmail({
    email,
    subject: `Phrase.fm - Welcome!`,
    template: `welcome`,
    data,
  })
  return response
}
