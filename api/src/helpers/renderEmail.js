
import path from 'path'
import { EmailTemplate } from 'email-templates'

import { clientURL, apiURL } from '../config'

export default async ({ template, data }) => {
  data.homeURL = `${clientURL}`
  data.imgURL = `${apiURL}/img`
  let emailTemplate = new EmailTemplate(path.resolve(`templates`, `templates`, template))
  let render = await new Promise((resolve, reject) => {
    emailTemplate.render(data, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
  return render.html
}
