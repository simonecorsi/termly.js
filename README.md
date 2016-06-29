#### Simple Browser Terminal Simulator

**will write docs later.**
#### install

    bower install browser-terminal.js

######  USAGE
include in your page
terminal.js or terminal.min.js

    <script src="terminal.min.js" charset="utf-8"></script>
    <script type="text/javascript">
      Terminal.init( document.getElementById('terminal_container'), custom_commands );
    </script>


######  EXTEND
./src/commands.js key/value pair when user enter a command it's checked against commands.js keys.

accepted data types:
- All Primitives
- Array
- Object
- Function
  - __functions **MUST** return one of the above data type**

custom commands can be added on init, pass a object with the new commands.
Commands can be of any type, if it's a fuction it MUST resturn a primitive value.
there are reserved keyword that wont be overrided (help,about,clear,exit) you must edit in commands.js and rebuild if you want to change them.

#### DEV
npm install
npm run build || npm run watch
