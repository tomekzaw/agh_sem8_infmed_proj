# IoMT app

This app has been implemented as a project for "Medical informatics" course on AGH University of Science and Technology.

Currently the following functionalities are covered:

- scanning for IoMT devices using Bluetooth Low Energy (BLE),
- establishing a connection with selected device,
- gathering medical signals from IoMT devices in realtime,
- recording the signal and saves data in device's filesystem,
- sending recordings using operating system sharing functionality.

For demonstration purposes, a BLE mock for MacOS has been implemented, which transmits a pre-recorded ECG signal.

## Authors

- Kasper Sapała [@kaszperro](https://github.com/kaszperro)
- Tomasz Zawadzki [@tomekzaw](https://github.com/tomekzaw)

## Requirements

- yarn 1.22.10
- Node.js v12.16.1
- Android: NDK 21.3.6528147
- iOS: XCode 12.5, CocoaPods 1.10.1

## Installation

### React Native app

```sh
cd app
yarn install
```

For iOS, it is also required to install pods:

```sh
cd ios
pod install
```

### IoMT BLE mock

```sh
cd node-ble-server
npm i
```

## Running

### React Native app

```sh
cd app
yarn react-native start
yarn react-native run-android
yarn react-native run-ios
```

### IoMT BLE mock

```sh
cd node-ble-server
node main.js
```

## Demo

Click below, to see recorded video of our application:

[youtube link](http://www.youtube.com/watch?v=c5qWgkflI20)

[![IoMT app demo](http://img.youtube.com/vi/c5qWgkflI20/0.jpg)](http://www.youtube.com/watch?v=c5qWgkflI20 "IoMT app demo")

Once the switch is toggled, the app will start scanning for IoMT devices nearby.

<img src="docs/screenshots/Scan-in-progress.png" alt="" width="300" />

When any device is detected, its name and identifier will be visible.

<img src="docs/screenshots/HomeScreen.png" alt="" width="300" />

If Bluetooth adapter is turned off, the following alert will show up.

<img src="docs/screenshots/Ble-turn-off.png" alt="" width="300" />

When a device is selected, the connection will be established and the app will read the signal from the device.

<img src="docs/screenshots/Plot.png" alt="" width="300" />

You may start recording anytime.

<img src="docs/screenshots/Recording.png" alt="" width="300" />

Once you stop the recording, the data will be saved to a file `iomt_{date}_{time}.csv` on your device.

<img src="docs/screenshots/SavedRecording.png" alt="" width="300" />

Then it is possible to share the file using native sharing functionality of your device's operating system.

<img src="docs/screenshots/Share-Middle.png" alt="" width="300" />

When deleting the recording, the app will ask you to confirm.

<img src="docs/screenshots/Delete-Confirm.png" alt="" width="300" />

Once the file is deleted, the success message will show up.

<img src="docs/screenshots/Delete-Success.png" alt="" width="300" />
