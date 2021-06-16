let bleno = require("@abandonware/bleno");
let csvParser = require('csv-parser');
let fs = require('fs');

const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const characteristicUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const notifyInterval = 100;
const name = "Bulbulator3000";
const filePath = 'ecg.data'

let csvData = getEkgData()
let csvDataOffset = 0
const startTime =  new Date().getTime();
const readBatchSize = 4
const samplingFreq = 100

let Characteristic = bleno.Characteristic;

var prevRequest = null;

function getEkgData() {
  let data = []

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', function(row){
      try {
        data.push(row)
      }
      catch(err) {
        //error handler
      }
    })
    .on('end',function(){
      //some final operation
    });

  return data
}



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
  const xs = []
  const ys = []

  const end = csvDataOffset + readBatchSize

  for(; csvDataOffset < end && csvDataOffset < csvData.length; ++csvDataOffset) {
    let x = startTime + csvDataOffset * (1000/samplingFreq);
    let y = parseFloat(csvData[csvDataOffset]['ECG']);
    xs.push(x)
    ys.push(y)
  }

  const response = { xs: xs, ys: ys };
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
