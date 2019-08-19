const DATA =      PIN_TX;
const CLOCK =     PIN_2;
const VCC =       PIN_RX;
const GND =       PIN_0;

const ROWS =      1;
const COLUMNS =   128;
const LCD_ADDRESS = 0x3c;
const LCD_ADDRESS_BITS = (address) => ('0000000' + (address).toString(2)).slice(-7).split('');

function setupPins() {
  write(DATA, 0);
  write(CLOCK, 0);
  write(VCC, 1);
  write(GND, 0);
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

function sendPixel(value) {
  const bits = [value, 0, 0, 0, 0, 0, 0, 0];
  bits.forEach(bit => send(bit));
}

async function dataReceived() {
  //tick();
  //tick();
  //tick();
  tick();
  const ack = await read(DATA);
  //tick();
  //tick();
  //tick();

  return ack == 0;
}

async function sendMatrix(address) {
  setupPins();
  reset();

  let cursor = 0;
  const bytes = matrix.reduce((buffer, line) => buffer.concat(line), []);
  const end = bytes.length - 1;

  start();

  // send slave address
  LCD_ADDRESS_BITS(address).forEach(bit => send(bit));

  // Write bit
  send(0);

  const received = await dataReceived();

  if (!received) {
    console.log('No slave at %d', address);
    return await wait(100);
  }

  console.log('Found slave', address);

  while (cursor < end) {
    sendPixel(bytes[cursor]);

    let received = await dataReceived();
    if (received) {
      cursor++;
    }
  }

  stop();

  return true;
}

const matrix = Array.from({ length: ROWS }).map(() => Array.from({ length: COLUMNS }).fill(0));
matrix.forEach((line, lineIndex) => {
  line.forEach((dot, index) => {
    line[index] = Number(index % lineIndex > 0);
  });
});

await sendMatrix(LCD_ADDRESS);

// console.log(matrix.map(line => line.join('')).join('\n'));
// let slaveAddress = 0x00;
// while (slaveAddress < 0xff) {
//   let found = await sendMatrix(++slaveAddress);
//   if (found === true) {
//    break;
//   }
// }

