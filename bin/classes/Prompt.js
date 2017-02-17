var Shell = require('./Shell')

/**
 * Terminal
 * Wrapper on the Shell class
 * This will only handle the UI of the terminal.
 * You can use it or use directly the browser-shell.js
 * and create your custom UI calling and displaying the @method run() commands
 * ___________
 * Options:
 *  - filesystem {Object}
 *  - commands {Object}
 *  - env {Object}
 */
class Prompt extends Shell{
  constructor(selector = undefined, options = {}) {
    super(options) // must pass option here

    if (!selector) throw new Error('No wrapper element selector provided')
    try {
      this.container = document.querySelector(selector)
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
      current.querySelector('input').disabled = true
    }

    let prevInput = document.querySelector('.terminal-input')
    if (prevInput) {
      prevInput.removeEventListener('input', this.resizeHandler)
      prevInput.blur()
    }

    const div = document.createElement('div')
    div.classList.add('current', 'terminal-row')
    div.innerHTML = ''
    div.innerHTML += `<span class="terminal-info">${this.env.USER}@${this.env.HOSTNAME} - ${this.fs.getCurrentDirectory()} ➜ </span>`
    div.innerHTML += `<input type="text" class="terminal-input" size="2" style="cursor:none;">`

    // add new row and focus it
    this.container.appendChild(div)
    let input = this.container.querySelector('.current .terminal-input')
    let currentRow = this.container.querySelector('.current.terminal-row')
    let currentPrompt = currentRow.querySelector('.terminal-info')
    let inputWidth = currentRow.offsetWidth - currentPrompt.offsetWidth - 20
    input.style.width = inputWidth + "px"
    input.addEventListener('keyup', e => this.submitHandler(e))
    input.select()
    this.container.scrollTop = this.container.scrollHeight + 1

    return input
  }

  generateOutput(out = '', newLine = true) {
    if (Array.isArray(out)) {
      out = out.join("\n")
    }
    const pre = document.createElement('pre')
    pre.textContent = out
    pre.className = 'terminal-output'
    this.container.appendChild(pre)
    if (newLine) {
      return this.generateRow()
    }
  }

  clear() {
    this.container.innerHTML = ''
    return this.generateRow()
  }

  submitHandler(e) {
    if (e.which == 13 || e.keyCode == 13) {
      e.preventDefault()
      const command = e.target.value.trim()

      if (command === 'clear') return this.clear()

      // EXEC
      let output = this.run(command)

      // if is a {Promise} resolve it ad parse as json response
      if (output['then']) {
        this.generateOutput('Pending request...', false)
        return output.then(res => {
          if (typeof res === 'object') {
            try {
              res = JSON.stringify(res, null, 2)
            } catch (e) {
              return this.generateOutput('-fatal http: Response received but had a problem parsing it.')
            }
          }
          return this.generateOutput(res)
        }).catch(err => this.generateOutput(err.message))
      }

      if (typeof output === 'object' || Array.isArray(output)) {
        output = JSON.stringify(output, null, 2)
      }

      return this.generateOutput(output)
    }
  }
}

module.exports = Prompt
