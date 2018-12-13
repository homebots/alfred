(function () {
  function init() {
    const actions = {
      'script.reset': resetScript,
      'script.send': runScript,
    };

    document.addEventListener('click', function (event) {
      const node = event.target;

      while (node.parentNode) {
        const action = node.getAttribute('data-action');

        if (action && actions[action]) {
          actions[action].call(null, event);
        }

        node = node.parentNode;
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
