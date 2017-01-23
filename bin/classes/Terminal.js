var Shell = require('./Shell')

/**
 * Terminal
 * Wrapper on the Shell class
 * This will only handle the UI of the terminal.
 * You can use it or use directly the browser-shell.js
 * and create your custom UI calling and displaying the Shell.run() commands
 */
class Terminal extends Shell{
  constructor(selector = undefined, options = {}) {

    super(options) // must pass option here

    this.hostname = options.hostname || 'host'

    if (!selector) throw new Error('No wrapper element selector provided')
    try {
      this.container = document.querySelector(selector)
      console.log(this.container)
      if (!this.container) throw new Error('new Terminal(): DOM element not found')
    } catch (e) {
      throw new Error('new Terminal(): Not valid DOM selector.')
    }

    return this.init()
  }

  init() {
    this.generateRow()
    this.container.addEventListener('click', (e) => {
      e.stopPropagation()
      let input = this.container.querySelector('.current .terminal-input')
      if (input) input.focus()
    })
  }

  generateRow() {
    var that = this

    // Remove previous current active row
    let current = document.querySelector('.current.terminal-row')
    if (current) {
      current.classList.remove('current')
    }

    let prevInput = document.querySelector('.terminal-input')
    if (prevInput) {
      prevInput.removeEventListener('keyup', this.submitHandler)
    }

    const div = document.createElement('div')
    div.classList.add('current', 'terminal-row')
    div.innerHTML = ''
    div.innerHTML += `<span class="terminal-info">guest@${this.hostname} ➜ </span>`
    div.innerHTML += `<input type="text" class="terminal-input" size="2" style="cursor:none;">`

    // add new row and focus it
    this.container.appendChild(div)
    let input = this.container.querySelector('.current .terminal-input')
    input.addEventListener('keyup', e => this.submitHandler(e))
    input.focus()

    return input
  }

  generateOutput(out = '') {
    const pre = document.createElement('pre')
    pre.innerHTML = out
    this.container.appendChild(pre)
    return this.generateRow()
  }

  submitHandler(e) {
    e.stopPropagation()
    // RUN when ENTER is pressed
    if (event.which == 13 || event.keyCode == 13) {
      e.preventDefault()
      const command = e.target.value.trim()
      // EXEC
      const output = this.run(command)
      return this.generateOutput(output)
    }
  }
}

module.exports = Terminal
