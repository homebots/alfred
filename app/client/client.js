'use strict';
(function (BotProtocol) {
  let Bot;

  function init() {
    Bot = new BotProtocol.BrowserClient('wss://w.homebots.io/hub');

    const input = document.getElementById('scriptInput');
    const submit = document.getElementById('submitBtn');

    function resetScript() {
      input.value = '';
    }

    async function runScript() {
      input.disabled = true;
      submit.disabled = true;
      let output;

      try {
        output = await Bot.runScript(input.value);
      } catch (error) {
        output = error;
      }

      console.log(output);

      input.disabled = false;
      submit.disabled = false;
    }

    const actions = {
      'script.reset': resetScript,
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
