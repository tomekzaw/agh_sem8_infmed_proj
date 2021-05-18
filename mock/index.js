var bleno = require("@abandonware/bleno");

const name = "Long name works now";
const serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

bleno.on("stateChange", function (state) {
  if (state === "poweredOn") {
    bleno.startAdvertising(name, [serviceUuid]);
  }
});
