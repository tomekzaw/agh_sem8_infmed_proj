# IoMT app

This app:

- scans for IoMT devices using Bluetooth Low Energy (BLE),
- establishes a connection with selected device,
- gathers medical signals from IoMT devices in realtime,
- records the signal and saves data in device's filesystem,
- sends recordings using operating system sharing functionality.

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

Once the switch is toggled, the app will start scanning for IoMT devices nearby.

![](docs/screenshots/Scan-in-progress.png)

When any device is detected, its name and identifier will be visible.

![](docs/screenshots/HomeScreen.png)

If Bluetooth adapter is turned off, the following alert will show up.

![](docs/screenshots/Ble-turn-off.png)

When a device is selected, the connection will be established and the app will read the signal from the device.

![](docs/screenshots/Plot.png)

You may start recording anytime.

![](docs/screenshots/Recording.png)

Once you stop the recording, the data will be saved to a file `iomt_{date}_{time}.csv` on your device.

![](docs/screenshots/SavedRecording.png)

Then it is possible to share the file using native sharing functionality of your device's operating system.

![](docs/screenshots/Share-Middle.png)

When deleting the recording, the app will ask you to confirm.

![](docs/screenshots/Delete-Confirm.png)

Once the file is deleted, the success message will show up.

![](docs/screenshots/Delete-Success.png)
