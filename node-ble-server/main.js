let bleno = require("@abandonware/bleno");

const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const characteristicUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const notifyInterval = 50;
const name = "Bulbulator3000";

let Characteristic = bleno.Characteristic;

var prevRequest = null;

// function processRequest(request) {
//   const { min, max, length } = request;
//   const pesel = Math.random().toFixed(11).split(".")[1];
//   const ekg = Array.from(
//     { length },
//     () => min + Math.floor(Math.random() * (max - min + 1))
//   );
//   return { pesel, ekg };
// }

function onWriteRequest(data, offset, withoutResponse, callback) {
  prevRequest = JSON.parse(data.toString("utf8"));

  callback(Characteristic.RESULT_SUCCESS);
}

function onReadRequest(offset, callback) {
  // const response = processRequest(prevRequest);
  const response = {};

  var data = Buffer.from(JSON.stringify(response), "ascii");

  if (offset > data.length) {
    callback(Characteristic.RESULT_INVALID_OFFSET, null);
  } else {
    callback(Characteristic.RESULT_SUCCESS, data.slice(offset));
  }
}

var isSubscribed = false;

function onSubscribe(maxValueSize, updateValueCallback) {
  isSubscribed = true;
  loopNotify(updateValueCallback);
  this._updateValueCallback = updateValueCallback;
}

function onUnsubscribe() {
  isSubscribed = false;
  this._updateValueCallback = null;
}

function* ekg_generator() {
  while (true) {
    for (let i = 0; i < 10; ++i) {
      yield i;
    }
  }
}

const generator = ekg_generator();

function notify(callback) {
  const response = { value: generator.next().value };
  const data = Buffer.from(JSON.stringify(response));
  callback(data);
}

function loopNotify(callback) {
  setTimeout(function () {
    if (isSubscribed) {
      notify(callback);
      loopNotify(callback);
    }
  }, notifyInterval);
}

let characteristic = new Characteristic({
  uuid: characteristicUUID,
  properties: ["read", "write", "notify", "indicate"],
  value: null,
  descriptors: [
    new bleno.Descriptor({
      uuid: "2902",
      value: "Hello word",
    }),
  ],
  onReadRequest: onReadRequest,
  onWriteRequest: onWriteRequest,
  onSubscribe: onSubscribe,
  onUnsubscribe: onUnsubscribe,
  onNotify: null,
  onIndicate: null,
});

let PrimaryService = bleno.PrimaryService;

let primaryService = new PrimaryService({
  uuid: serviceUUID,
  characteristics: [characteristic],
});

bleno.on("stateChange", function (state) {
  if (state === "poweredOn") {
    bleno.startAdvertising(name, [serviceUUID]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on("advertisingStart", function (error) {
  if (!error) {
    bleno.setServices([primaryService]);
  }
});
