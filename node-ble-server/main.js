let bleno = require("@abandonware/bleno");

const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const characteristicUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const notifyInterval = 50;
const name = "Bulbulator3000";

const ekgData = require('./ekg.json')

const startTime = new Date().getTime();
const readBatchSize = 4
const samplingFreq = 100

let Characteristic = bleno.Characteristic;

var prevRequest = null;

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
    yield* ekgData
  }
}

function* time_generator() {
  for (let i = 0; ; ++i) {
    yield  startTime + i * (1000 / samplingFreq);
  }
}

const ys_generator = ekg_generator();
const xs_generator = time_generator();

function notify(callback) {
  const xs = []
  const ys = []

  for (let i = 0; i < readBatchSize; ++i) {
    xs.push(xs_generator.next().value)
    ys.push(ys_generator.next().value)
  }

  const response = {xs: xs, ys: ys};
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
