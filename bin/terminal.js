(function (window, document, undefined) {
  let Terminal = {
    init: function ( terminal_container, custom_commands, custom_filesystem ) {
      this.Commands = require('./commands');
      this.Commands.__initFS(custom_filesystem || null);
      if(custom_commands) this.addCustomCommands(custom_commands);
      this.terminal_container = terminal_container;
      this.generateRow( terminal_container );
      window.addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementsByClassName('current')[0].children[1].focus();
      });
    },
    generateTerminalRow:function () {
      let that = this;
      return '\
        <span class="terminal_info">guest@'+ (location.hostname ? location.hostname : 'localhost') +' \
        ➜ '+ that.Commands.pwd() +' </span> \
        <input type="text" class="terminal_input" size="1" style="cursor:none;"> \
      ';
    },
    addCustomCommands:function (custom_commands) {
      for(let key in custom_commands){
        if(custom_commands.hasOwnProperty(key) && !this.Commands[key]){
          this.Commands[key] = custom_commands[key];
        }
      }
    },
    generateRow: function ( terminal_container ) {
      let that = this;
      let terminal_row, current, input;
      terminal_row = document.createElement('div');
      current = document.querySelectorAll(".current")[0];
      if(current){
        current.children[1].disabled = true;
        current.className = 'terminal_row';
      }
      terminal_row.className = 'current terminal_row';
      terminal_row.innerHTML = this.generateTerminalRow();
      terminal_container.appendChild(terminal_row);
      current = terminal_container.querySelector('.current');
      input = current.children[1];
      input.focus();
      input.addEventListener('keyup', that.consoleTypingHandler );
    },
    getSTDIN: function (command) {
      let argv = command.trim().split(" ");
      let res = this.parseCommand(argv);
      if(!!res) this.sendSTDOUT(res);
    },
    sendSTDOUT: function (message, exit) {
      let res = document.createElement('div');
      res.className = 'terminal_stdout';
      res.innerText = message;
      this.terminal_container.appendChild(res);
      if(!exit) this.generateRow(this.terminal_container);
    },
    parseCommand:function (argv) {
      let that = this;
      let Commands = this.Commands;
      let command = argv.shift();

      for(let key in Commands){
        if(Commands.hasOwnProperty(key) && command === key){
          let stdout;
          let res = (typeof Commands[key] === 'function') ? Commands[key]( argv.length ? argv : null ) : Commands[key] ;
          switch (true) {
            case (typeof res === 'string' && res === 'SGEXIT'):
              that.exitHandler();
              return null;
              break;
            case (typeof res === 'string' && res === 'SGCLEAR'):
              that.clearHandler();
              return null;
              break;
            case (typeof res === 'string'):
              stdout = res;
              break;
            case (typeof res === 'object' && Array.isArray(res)):
              res.unshift("");
              stdout = res.join('\n').replace( new RegExp( '\n', 'g' ), '\n- ' );
              break;
            case (typeof res === 'object' && !Array.isArray(res)):
              stdout = JSON.stringify(res, null, 2);
              break;
            default:
              return res;
          }
          return stdout;
        }
      }
      return "Command not found: type help for list of commands.";
    },
    exitHandler: function () {
      this.sendSTDOUT('Bye bye!', true);
      setTimeout(function () {
        location.reload();
      },1000)
    },
    clearHandler: function () {
      this.terminal_container.innerHTML = '';
      this.init( this.terminal_container ) ;
    },
    consoleTypingHandler: function (e) {
      let input = this;
      let size = input.size;
      let value = input.value;
      let key = e.which || e.keyCode;
      if (key === 13){
        Terminal.getSTDIN(input.value);
        return;
      }
      if( key >= 32 && key <= 126 ){
        input.size = value.length + 2;
      }
      if( key === 8){
        input.size = value.length ? value.length : 1;
      }
    },
  };
  window.Terminal = Terminal;
})(window, window.document)
