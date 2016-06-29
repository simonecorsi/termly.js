(function (window, document, undefined) {
  const Commands = require('./commands');
  var terminal_row = '\
    <span class="term_head" style="color:lightgreen;">➜</span> \
    <input type="text" class="command_input" size="1"> \
  ';

  var Terminal = {
    init: function ( terminal_container, custom_commands ) {
      this.Commands = Commands;
      if(custom_commands) this.addCustomCommands(custom_commands);
      this.terminal_container = terminal_container;
      this.generateRow( terminal_container );
      window.addEventListener('click', function () {
        document.getElementsByClassName('current')[0].children[1].focus();
      });
    },
    addCustomCommands:function (custom_commands) {
      for(var key in custom_commands){
        if(custom_commands.hasOwnProperty(key) && !this.Commands[key]){
          this.Commands[key] = custom_commands[key];
        }
      }
    },
    generateRow: function ( terminal_container ) {
      var that = this;
      var t, current, input;
      t = document.createElement('div');
      current = document.querySelectorAll(".current")[0];
      if(current){
        current.children[1].disabled = true;
        current.className = 'inner_terminal';
      }
      t.className = 'current inner_terminal';
      t.innerHTML = terminal_row;
      terminal_container.appendChild(t);
      current = terminal_container.querySelector('.current');
      var input = current.children[1];
      input.focus();
      input.addEventListener('keydown', that.consoleTypingHandler );
      return t;
    },
    getSTDIN: function (command) {
      var that = this;
      var res = that.parseCommand(command);
      console.log(res);
      if(!!res) that.sendSTDOUT(res);
    },
    sendSTDOUT: function (message, exit) {
      var res = document.createElement('pre');
      res.innerText = message;
      this.terminal_container.appendChild(res);
      if(!exit) this.generateRow(this.terminal_container);
    },
    parseCommand:function (command) {
      var that = this;
      var Commands = this.Commands;
      for(var key in Commands){
        if(Commands.hasOwnProperty(key) && command === key){
          var res = (typeof Commands[key] === 'function') ? JSON.stringify(Commands[key](), null, 2) : JSON.stringify(Commands[key], null, 2) ;
          switch (true) {
            case (typeof res === 'string' && res === '"SGEXIT"'):
              that.exitHandler();
              return null;
              break;
            case (typeof res === 'string' && res === '"SGCLEAR"'):
              that.clearHandler();
              return null;
              break;
            default:
              return res;
          }
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
      var input = this;
      //var size = input.size;
      var key = e.which || e.keyCode;
      if (key === 13){
        Terminal.getSTDIN(input.value);
        return;
      } else {
        input.size += 1;
      }
    },

  };

  window.Terminal = Terminal;
})(window, window.document)
