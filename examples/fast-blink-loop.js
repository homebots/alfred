while (true) {
  var loopRounds = 10;

  function flipPins(value) {
    write(PIN_0, value);
    write(PIN_TX, value);
    write(PIN_2, value);
    write(PIN_RX, value);
  }

  while (loopRounds--) {
    flipPins(OFF);
    delay(50);
    flipPins(ON);
    delay(50);
  }

  await wait(5000);
}
