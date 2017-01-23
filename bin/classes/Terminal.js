/**
 * Terminal
 * Wrapper on the Shell class
 * This will only handle the UI of the terminal.
 * You can use it or use directly the browser-shell.js
 * and create your custom UI calling and displaying the Shell.run() commands
 */
class Terminal {
  constructor({ selector }) {
    if (!selector) throw new Error('No wrapper element selector provided')

    if (selector.match(/^\#.+/)) {
      try {
        this.container = document.getElementById(selector)
        if (this.container instanceof Node) throw new Error('Invalid DOM element')
      } catch (e) {
        throw new Error('Not valid DOM selector.')
      }
    }
  }
}

module.exports = Terminal
