import {
  rUserGetFromEmail,
  rOAuthInsert,
  rUserUpdate,
  rOAuthDeleteFromEmail,
} from './db-helpers'

import { generateUniqueToken } from './token'

export let completeOAuth = ({ res, io, err, user, info }) => {
  if (!user) {
    console.log(`oAuth error: ${err}::${info}::${user}`)
    io.emit(`server::oAuthUser`, { error: true })
  }
  else io.emit(`server::oAuthUser`, user)

  res.send(`<script type="text/javascript">window.close()</script>`)
  res.end()
}

export let handleOAuth = async ({ profile, done, db }) => {
  try {
    let { emails, photos } = profile
    if (!photos || !emails) {
      done(null, { success: false })
      return
    }

    let { value: email } = emails[0]
    let { value: picture } = photos[0]

    let lowerCaseEmail = email.toLowerCase()
    let oAuthToken = await generateUniqueToken({ table: `oAuth`, index: `oAuthToken`, db })
    let user = await rUserGetFromEmail(db, { email })

    // Remove old oAuth login credentials, insert new one
    await rOAuthDeleteFromEmail(db, { email })
    await rOAuthInsert(db, {
      email,
      oAuthToken,
      picture,
    })

    if (user) // If user exists update their info
      await rUserUpdate(db, {
        id: user.id,
        update: { picture },
      })

    done(null, {
      success: true,
      email: lowerCaseEmail,
      token: oAuthToken,
      newUser: !user || !user.username,
    })
  }
  catch (e) {
    console.log(e)
    done(e)
  }
}
