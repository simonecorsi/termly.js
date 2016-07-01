## Simple Browser Terminal Simulator
#### \*NIX Like Terminal For Browser use

PureJS, No Depencies, No styling included you must style it yourself :)
There is just a very basic styling in the test.html file just for testing purposes.

[Demo](http://terminal.simonecorsi.me/)

#### Why?

I needed a simple simulated terminal to use on one of my project just for presentation purposes and some funny re-uses,
didn't find something light and easy to extend as I wanted so here it comes!

There are basic commands but you can easily extend them when init() the plugin,
Want more? There is a fake filesystem too and you can pass a custom one too as an object when init() te plugin.

#### install

    bower install browser-terminal.js

####  USAGE

    <div id="terminal_container"></div>
    <script src="terminal.min.js" charset="utf-8"></script>
    <script type="text/javascript">
      //  example of custom_commands
      var custom_commands = {
        print_str: "I get printed to STout",
        print_json: {
          inner: 'this whole nested object get it\'s printed to STDout'
        },
        print_list: [
          'I\' m printed',
          'as a pointed',
          'list',
        ],
        do_something: function( argv ){
          // call do_something argv1 argv2 etc goes in in argv array
          // do some calculation or whatever
          return string|array|object;
        }
      }
      //  example of custom filesystem
      var custom_filesystem = {
        "testingCustomFs":{
          "file": "Im a file",
          "nestedDir": {
            "file2": "file"
          }
        }
      }
      Terminal.init( document.getElementById('terminal_container'), custom_commands, custom_filesystem );
    </script>  

####  EXTENDs

You can add custom commands, they get printed on STDout when called.
accepted data types:
- All Primitives
- Array
- Object
- Function
  - __functions MUST return one of the above data type__

Commands can be of any type, if it's a function it **MUST** return a primitive value.
there are reserved keyword that wont be overrided (see below), you must edit in commands.js and rebuild if you want to change them.

PreExistent Command are in ./src/commands.js you must rebuild if you want to change them
- help (commands avaibles)
- cd (change dir)
- ls (list dir)
- pwd (Print Working Directory)
- about ( about this package )
- clear (clear screen )
- exit ( reload the page pretty useless)
- cat (read a "file")

#### filesystem object parsing

Root object is root dir /
Nested object are Directory
Primitives properties are files
Array are files and gets printed as a list

#### Generatoed HTML to style

    <div id="terminal_container">
      <div class="terminal_row">
        <span class="terminal_info"></span>
        <input class="terminal_input">
      </div>
      <div class="terminal_row current">
        <span class="terminal_info"></span>
        <input class="terminal_input">
      </div>
    </div>

#### DEV

    npm install
    npm run build || npm run watch
