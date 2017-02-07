const { location } = global || window

module.exports = {

  USER: 'root',

  HOSTNAME: location && location.hostname.length ? location.hostname : 'my.host.me',

}
