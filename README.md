<meta property="og:image" content="https://github.com/Kirkhammetz/termly.js/blob/gh-pages/images/termlyjs-preview.png?raw=true">

# [Termly.js](http://termlyjs.info/)
### Simple, Extensible, Hackable and Lightweight Browser Terminal Simulator!

Want to showcase your new shiny CLI Tool you just released? <br />
Want to write HowTos on how some commands behaves? <br />
Want to create a simulated sandbox of linux-like commands to help people learn? <br />
You want to have fun (as I had) making your personal website readable from a fake terminal? <br />
Doit interactively! <br />

<div align="center">
  <h4>Use inside a nice wrapper</h4>
  <img src="https://github.com/Kirkhammetz/termly.js/blob/statics/termly.gif?raw=true" align="center" />
</div>
<div align="center">
  <h4>Or calling directly to the class and building your own wrapper</h4>
  <img src="https://github.com/Kirkhammetz/termly.js/blob/statics/console.gif?raw=true" align="center" />
</div>

## Documentation

+ Play with the [DEMO](http://termlyjs.info/#/#demo)
+ Read the [Documentations](http://termlyjs.info/) for all the options.
+ Below the [Changeslog](#changelog)

## Installing

Get the zip [Package](https://github.com/Kirkhammetz/termly.js/archive/master.zip) directly or better:

```sh
npm install termly.js
# OR
yarn add termly.js
# OR
bower install termly.js
```

## Getting Started

You can choose to use one of the two bundle coming with Termly.js, the main package have the shell only and all it's utilities you can use it as you wish, the prompt bundle is a simple DOM Wrapper that handles inputs and outputs and DOM manipulation, for the sake of simplicity with this you only have to attach a container and Style your terminal


```html
<!-- Get the Shell only package -->
<script src="node_modules/termly.js/dist/termly.min.js"></script>

<!-- OR Get the Shell + a Prompt I/O wrapper -->
<script src="node_modules/termly.js/dist/termly-prompt.min.js"></script>
```

Or get directly from the sources (Babel+Bundler workflow)

```js
// With a bundler
// @NB ES6 Classes are exported
const Shell = require('termly.js') // Shell only
// OR
const Prompt = require('termly.js/bin/classes/Prompt') // Init with a Prompt IO Wrapper
```

>Read the [docs](http://termlyjs.info/#/#bundles-differences) to know the differences

## Basic Usage

Both the Shell and the Prompt wrapper can get parameters at instantiation whose most important are a custom Filesystem and a set of custom commands, both fall back to defaults if not provided.

**Using the Prompt Wrapper**

You can attach Termly.js to a DOM container and have it do the work of creating and setting up input/output field and handlers and only care of styling it:

```html
<script src='dist/termly-prompt.min.js'></script>
<script>
  // Documentation for options in the next section
  var shell = new TermlyPrompt('#container', { /* options object */ })
</script>
```

>Read the [docs](http://termlyjs.info/#/#options) at website for all the options

**Using the Shell Class**

A more advanced approach to build something custom that suites your needs would be to use Termly.js Shell Class, thus extending it with a wrapper and handle yourself all the DOM Input/Output in the way you desire it to behave.

```html
<script src='dist/termly.min.js'></script>
<script>
  // Documentation for options in the next section
  var shell = new Termly({ /* options object */ })
  shell.run('help')
  //> 'Commands available: help, whoami, about, arguments, cd, ls, cat, man, http'
</script>
```

>Read the [docs](http://termlyjs.info/#/#options) at website for all the options

## Changelog

**2.5.6 - stable**

- Prompt.js: Array output returned from commands execution now stringified


**2.5.5**

- Fixed Filesystem methods cd-ing into files bug which cames with the change in how filesystem got inited some patch ago.

**2.5.4**

- Fixed ENV object not getting the defaults if empty object

**2.5.3**

- fixed printnev to print obejcts

**2.5.2**

- added pwd command

**2.5.1**

- Filesystem root dir structure instantialized as an instance of File()

**2.5.0**

- Added Commands `printenv` and `export`
- Added `env` object in shell class
  - You can provide an `env: {}` with all the variables you want set in `shell.env` at instantiation
  - You can see current session variables calling `printenv`
  - You can set a variable during runtime with `export VAR=value` or `export var='long value'`
- fake user and hostname are taken from the provided env (or from default), no more in the options object

## Contributing

Actually this fits my needs and it works as expected, but as someone pointed to my this can be useful so if you have nice ideas and you want to contribute get your copy and fiddle with!

If you have to open a PR if possible squash your commits before sending, so I can give it a look more easily.

If there are any issue let me know, I'll give it a look when I can.

## Authors

* **Simone Corsi** - *Initial work* - [Kirkhammetz](https://github.com/Kirkhammetz)

## Acknowledgments

[minimist](https://github.com/substack/minimist) Got inspiration to write my command parser

[Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)

[Fetch API Polyfill](https://github.com/github/fetch)

Some CSS I got here and there for the demo because I get bored styling, I really don't remember from who sorry :( Thank you anyway

## License

This project is licensed under the GNU GPL v3 License - see the [LICENSE.md](LICENSE.md) file for details
