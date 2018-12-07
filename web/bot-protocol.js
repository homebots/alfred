const BotInstruction = {
  Noop: 0x01,
  Reset: 0x02,
  Ping: 0x03,
  Write: 0x04,
  Read: 0x05,
  AnalogWrite: 0x06,
  AnalogRead: 0x07
};

class BotProtocol {
  constructor(client) {
    this.client = client;
  }

  ping() {
    this.client.sendBytes([2]);
  }

  reset() {
    this.client.sendBytes([1]);
  }

  read(pin) {
    pin = Number(pin);
    const buffer = new Uint8Array([BotInstruction.Read, pin]);
    this.client.sendBuffer(buffer);
  }

  analogRead(pin) {
    pin = Number(pin);
    const buffer = new Uint8Array([BotInstruction.AnalogRead, pin]);
    this.client.sendBuffer(buffer);
  }

  write(pin, value) {
    pin = Number(pin);
    value = Number(value);
    const buffer = new Uint8Array([BotInstruction.Write, pin, value ? 1 : 0]);
    this.client.sendBuffer(buffer);
  }

  analogWrite(pin, value) {
    pin = Number(pin);
    value = Number(value);
    if (value > 255) {
      value = 255;
    }

    const hexValue = '00' + value.toString(16);

    const buffer = new Uint8Array([
      BotInstruction.AnalogWrite, pin,
      hexValue.charCodeAt(0),
      hexValue.charCodeAt(1),
      hexValue.charCodeAt(2)
    ]);
    this.client.sendBuffer(buffer);
  }
}
