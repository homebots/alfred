'use strict';
(function (BotProtocol) {
  let Bot;

  function init() {
    Bot = new BotProtocol.BrowserClient('wss://w.homebots.io/hub');

    const input = document.getElementById('scriptInput');
    input.value = 'write(PIN_2, 1);console.log(await read(PIN_2));';

    const botFunctions = BotProtocol.Methods.map(fn => `const ${fn} = Bot.${fn}.bind(Bot);\n`).join('');
    const constants = 'const {' + Object.keys(BotProtocol.Constants).join(', ') + '} = Constants;';

    const wrapper = `
      ${botFunctions}
      ${constants}
      return function() {
        return (async () => { %s })()
      }`;

    function resetScript() {
      input.value = '';
    }

    async function runScript() {
      const source = input.value;
      const fn = Function('Bot', 'Constants', wrapper.replace('%s', source));
      const compiledCode = fn.call(null, Bot, BotProtocol.Constants);
      const output = await compiledCode.call(null);
      console.log(output);
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
