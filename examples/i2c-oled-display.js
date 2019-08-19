const DATA =      PIN_TX;
const CLOCK =     PIN_2;

const ROWS =          1;
const COLUMNS =       128;
const LCD_ADDRESS =   0x3c;
const FREQUENCY =     400000;

// Display commands
const CHARGEPUMP            = 0x8D;
const COLUMNADDR            = 0x21;
const COMSCANDEC            = 0xC8;
const COMSCANINC            = 0xC0;
const DISPLAYALLON          = 0xA5;
const DISPLAYALLON_RESUME   = 0xA4;
const DISPLAYOFF            = 0xAE;
const DISPLAYON             = 0xAF;
const EXTERNALVCC           = 0x1;
const INVERTDISPLAY         = 0xA7;
const MEMORYMODE            = 0x20;
const NORMALDISPLAY         = 0xA6;
const PAGEADDR              = 0x22;
const SEGREMAP              = 0xA0;
const SETCOMPINS            = 0xDA;
const SETCONTRAST           = 0x81;
const SETDISPLAYCLOCKDIV    = 0xD5;
const SETDISPLAYOFFSET      = 0xD3;
const SETHIGHCOLUMN         = 0x10;
const SETLOWCOLUMN          = 0x00;
const SETMULTIPLEX          = 0xA8;
const SETPRECHARGE          = 0xD9;
const SETSEGMENTREMAP       = 0xA1;
const SETSTARTLINE          = 0x40;
const SETVCOMDETECT         = 0xDB;
const SWITCHCAPVCC          = 0x2;

const DATA =      PIN_TX;
const CLOCK =     PIN_2;

const ROWS =          1;
const COLUMNS =       128;
const LCD_ADDRESS =   0x3c;

const matrix = Array.from({ length: ROWS }).map(() => Array.from({ length: COLUMNS }).fill(0));
matrix.forEach((line, lineIndex) => {
  line.forEach((dot, index) => {
    line[index] = Number(index % lineIndex > 0);
  });
});

function setupPins() {
  write(DATA, 0);
  write(CLOCK, 0);
  write(PIN_RX, 0);
  write(PIN_0, 0);
  i2cSetup(DATA, CLOCK);
}

function sendPixel(value) {
}

async function sendMatrix(address) {
  setupPins();

  const bytes = matrix.reduce((buffer, line) => buffer.concat(line), []);
  const end = bytes.length - 1;
  let cursor = 0;

  sendPixel(1);

  while (false) {
    sendPixel(bytes[cursor]);

    let received = await dataReceived();
    if (received) {
      cursor++;
    }
  }

  return true;
}

// ----

await sendMatrix(LCD_ADDRESS);

displayBufferSize = COLUMNS * ROWS / 8;

function display() {
  sendCommand(COLUMNADDR);
  sendCommand(x_offset);						// column start address (0 = reset)
  sendCommand(x_offset + (COLUMNS - 1));// column end address (127 = reset)
  sendCommand(PAGEADDR);
  sendCommand(0x0);							// page start address (0 = reset)
  sendCommand(0x3);

  buffer[-1] = 0x40; // control
  i2cWrite(_address, (char *)&buffer[-1], displayBufferSize + 1);
}

function sendInitCommands() {
  sendCommand(DISPLAYOFF);
  sendCommand(SETDISPLAYCLOCKDIV);
  sendCommand(0xF0); // Increase speed of the display max ~96Hz
  sendCommand(SETMULTIPLEX);
  sendCommand(ROWS - 1);
  sendCommand(SETDISPLAYOFFSET);
  sendCommand(0x00);
  sendCommand(SETSTARTLINE);
  sendCommand(CHARGEPUMP);
  sendCommand(0x14);
  sendCommand(MEMORYMODE);
  sendCommand(0x00);
  sendCommand(SEGREMAP);
  sendCommand(COMSCANINC);
  sendCommand(SETCOMPINS);

  sendCommand(0x02);
  sendCommand(SETCONTRAST);
  sendCommand(0x8F);

  sendCommand(SETPRECHARGE);
  sendCommand(0xF1);
  sendCommand(SETVCOMDETECT); //0xDB, (additionally needed to lower the contrast)
  sendCommand(0x40);	        //0x40 default, to lower the contrast, put 0
  sendCommand(DISPLAYALLON_RESUME);
  sendCommand(NORMALDISPLAY);
  sendCommand(0x2e);            // stop scroll
  sendCommand(DISPLAYON);
}

function resetDisplay() {
  clear();
  display();
}

function clear() {
  buffer.forEach((line) => line.fill(0));
}

function sendCommand(byte) {
  const bytes = [0x80, byte];
  i2cWrite(bytes);
}

await sendMatrix();
