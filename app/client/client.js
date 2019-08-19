'use strict';
(function (BotProtocol) {
  function init() {
    const Bot = new BotProtocol.BrowserClient('wss://hub.homebots.io/hub');
    const input = document.getElementById('scriptInput');
    const submit = document.getElementById('submitBtn');

    const editor = CodeMirror.fromTextArea(input, {
      lineNumbers: true,
      tabSize: 2,
      mode: 'javascript'
    });

    async function runScript() {
      submit.disabled = true;

      let output;

      try {
        output = await Bot.runScript(editor.getValue());
      } catch (error) {
        output = error;
      }

      console.log(output);

      submit.disabled = false;
    }

    const actions = {
      'script.send': runScript,
    };

    document.addEventListener('click', function (event) {
      let node = event.target;

      while (node.parentNode) {
        const action = node.getAttribute('data-action');

        if (action && actions[action]) {
          actions[action].call(null, event);
          return;
        }

        node = node.parentNode;
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})(window.BotProtocol);
