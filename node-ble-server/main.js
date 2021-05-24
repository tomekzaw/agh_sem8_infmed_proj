let bleno = require('@abandonware/bleno');


let SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
let CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
let NAME = 'HELLO FRIEND'


let exampleFunctions = {
    'ADD': (a, b) => a + b
}

let funRes = null

let Characteristic = bleno.Characteristic;

function onReadRequest(offset, callback) {
    console.log("Received read request")

    let output = {
        result: funRes
    }

    console.log(output)

    callback(Characteristic.RESULT_SUCCESS, new Buffer(JSON.stringify(output), 'ascii'));
}

function onWriteRequest(data, offset, withoutResponse, callback) {
    let encoded = data.toString('utf8')
    let json = JSON.parse(encoded)

    console.log("Received write request")
    console.log(json)

    let funName = json.functionName
    funRes = exampleFunctions[funName](...json.args)

    callback(Characteristic.RESULT_SUCCESS);

}

let characteristic = new Characteristic({
    uuid: CHARACTERISTIC_UUID, // or 'fff1' for 16-bit
    properties: ['read', 'write', 'notify', 'indicate'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
    value: null, // optional static value, must be of type Buffer - for read only characteristics
    descriptors: [
        new bleno.Descriptor({
            uuid: '2902',
            value: 'Hello word'
        })
    ],
    onReadRequest: onReadRequest, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: onWriteRequest, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify/indicate subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify/indicate unsubscribe handler, function() { ...}
    onNotify: null, // optional notify sent handler, function() { ...}
    onIndicate: null // optional indicate confirmation received handler, function() { ...}
});


let PrimaryService = bleno.PrimaryService;

let primaryService = new PrimaryService({
    uuid: SERVICE_UUID,
    characteristics: [
        characteristic
    ]
});


console.log('Starting BLE server');

bleno.on('stateChange', function (state) {
    console.log('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
        bleno.startAdvertising(NAME, [SERVICE_UUID]);
    } else {
        bleno.stopAdvertising();
    }
});


bleno.on('advertisingStart', function (error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {
        bleno.setServices([
            primaryService
        ]);
    }
});
