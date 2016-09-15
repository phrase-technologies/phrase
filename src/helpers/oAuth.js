
export let completeOAuth = (res, io, err, user) => {
  if (!user) {
    console.log(err)
    io.emit(`server::oAuthUser`, { error: true })
  }
  else io.emit(`server::oAuthUser`, user)

  res.send(`<script type="text/javascript">window.close()</script>`)
  res.end()
}
