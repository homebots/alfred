const DATA = PIN_TX;
const CLOCK = PIN_0;
const LCD_ADDRESS = 0x3c;
const LCD_ADDRESS_BITS = ('0000000' + (LCD_ADDRESS).toString(2)).slice(-7).split('');

function lowerPins() {
  write(DATA, 0);
  write(CLOCK, 0);
  write(PIN_2, 0);
  write(PIN_RX, 0);
}

function reset() {
  write(DATA, 1);
  write(CLOCK, 1);
}

function start() {
  write(DATA, 0);
  write(CLOCK, 0);
}

function stop() {
  write(CLOCK, 1);
  write(DATA, 1);
}

function tick() {
  write(CLOCK, 1);
  write(CLOCK, 0);
}

function send(value) {
  write(DATA, value);
  tick();

  if (value) {
    write(DATA, 0);
  }
}

async function readAckBit() {
  tick();
  tick();
  tick();
  const ack = await read(DATA);
  tick();
  tick();
  tick();
  tick();

  return ack;
}

async function sendMatrix() {
  lowerPins();
  reset();

  let cursor = 0;
  const bytes = matrix.reduce((buffer, line) => buffer.concat(line), []);
  const end = bytes.length - 1;

  start();

  // send slave address
  LCD_ADDRESS_BITS.forEach(bit => send(bit));

  // R/W bit
  send(1);

  const slaveNotFound = !await readAckBit();

  if (slaveNotFound) {
    console.log('No slave');
    return;
  }

  while (cursor < end) {
    send(bytes[cursor]);
	let failed = await readAckBit();

    if (!failed) {
	  cursor++;
    }
  }

  stop();
}

// 128 x 32
const matrix = Array.from({ length: 32 }).map(() => Array.from({ length: 128 }).fill(0));
matrix.forEach((line, lineIndex) => {
  line.forEach((dot, index) => {
    line[index] = Number(index % lineIndex > 0);
  });
});

console.log(matrix.map(line => line.join('')).join('\n'));

return sendMatrix();
