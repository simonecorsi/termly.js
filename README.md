## Simple Browser Terminal Simulator
#### \*NIX Like Terminal For Browser use

#### Why?
I needed a simple terminal to use on one of my project just for presentation purposes and some fun uses,
didn't find something light and easy as I wanted so here it comes.

There are basic commands but you can easily extend them on plugin init, \n
Want more? There is a simple dir/file (Fake) filesystem and you can pass a custm one too as an object.

PureJS, No Depencies, No styling included you must style it yourself :)
There is just a very basic styling in the test.html file just for testing purposes.

#### install

    bower install browser-terminal.js

####  USAGE

    <div id="terminal_container"></div>
    <script src="terminal.min.js" charset="utf-8"></script>
    <script type="text/javascript">
      var custom_commands = {
        custom: "CUSTOM!!!",
      }
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
  - __functions **MUST** return one of the above data type__

Commands can be of any type, if it's a fuction it MUST resturn a primitive value.
there are reserved keyword that wont be overrided (help,about,clear,exit) you must edit in commands.js and rebuild if you want to change them.

PreExistent Command are in ./src/commands.js you must rebuild if you want to change them
- help (commands avaibles)
- cd (change dir)
- ls (list dir)
- pwd (Print Working Directory)
- about ( about this package )
- clear (clear screen )
- exit ( reload the page pretty useless)
- cat (read a "file")

#### filesystem
Nested Object == nested directory, string property == file.


#### DEV

npm install
npm run build || npm run watch
