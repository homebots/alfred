(function () {

  function stringToBuffer(string) {
    const length = string.length;
    const buffer = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      buffer[i] = string.charCodeAt(i);
    }

    return buffer;
  }

  function addTimestamp(text) {
    if (!text) return '';

    const now = new Date();
    return `${now.getHours()}:${now.getMinutes()} ${text}`;
  }

  class BotClient {
    constructor(config) {
      Object.assign(this, config);
      this.connect();
      setInterval(() => this.socket || this.connect(), this.reconnectInterval || 5000);
    }

    connect() {
      const socket = new WebSocket(this.url);
      socket.binaryType = 'arraybuffer';

      socket.onmessage = (event) => this.onMessage(event.data);
      socket.onopen = () => this.onSocketOpen();
      socket.onclose = () => this.onSocketClose();

      this.socket = socket;
    }

    onSocketOpen() {
      this.socket.send('!!web');
    }

    onSocketClose() {
      this.socket = null;
    }

    onMessage(message) {}

    sendString(string) {
      const buffer = stringToBuffer(string);
      this.sendBuffer(buffer);
    }

    sendBuffer(byteArray) {
      this.socket.send(byteArray.buffer);
    }

    sendBytes(bytes) {
      const length = bytes.length;
      const buffer = new Uint8Array(length);

      for (let i = 0; i < length; i++) {
        buffer[i] = bytes[i];
      }

      this.sendBuffer(bytes);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const stdout = document.querySelector('#output');
    const client = new BotClient({ url: 'ws://localhost:2020/a'});

    function buffer2string(buffer) {
      return String.fromCharCode.apply(null, Array.from(buffer));
    }

    function readAnalogValue(buffer) {
      let chars = buffer2string(buffer);
      chars = '0000'.slice(4 - chars.length) + chars;
      return parseInt(chars, 16);
    }

    function readDigitalValue(byte) {
      return +String.fromCharCode(byte);
    }

    function receiveMessage(buffer) {
      const bytes = new Uint8Array(buffer);

      switch (Number(String.fromCharCode(bytes[0]))) {
        case BotInstruction.Read:
        case BotInstruction.AnalogRead:
          window.pinReading.value = isAnalog.checked ?
            readAnalogValue(bytes.slice(2)) :
            readDigitalValue(bytes[2]);
          break;

        default:
          console.log(buffer2string(new Uint8Array(buffer)));
      }
    }

    client.onMessage = (message) => {
      if (message instanceof ArrayBuffer) {
        return receiveMessage(message);
      }

      stdout.innerText += addTimestamp(message + '\n');
    };

    const botProtocol = window.botProtocol = new BotProtocol(client);

    window.writeToPin = function() {
      const pin = window.pinNumber.value;
      const value = window.pinValue.value;
      isAnalog.checked ?
        botProtocol.analogWrite(pin, value) :
        botProtocol.write(pin, value);
    };

    window.readPin = function() {
      const pin = window.pinNumber.value;
      isAnalog.checked ?
        botProtocol.analogRead(pin) :
        botProtocol.read(pin);
    };

    window.pulsePin = function() {
      const pin = window.pinNumber.value;
      let i = 0, max = 32;

      const timer = setInterval(() => {
        let value = i > max ? max * 2 - i : i;
        i++;

        botProtocol.analogWrite(pin, value);

        if (i > max * 2) {
          clearInterval(timer);
        }
      }, 16);
    };

    window.monitorPin = function () {
      setInterval(readPin, 100);
    };
  });
})();