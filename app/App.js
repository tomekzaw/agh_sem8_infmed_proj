/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {Button, StyleSheet, Text, View} from 'react-native';
import {Buffer} from 'buffer';
import {BleManager} from 'react-native-ble-plx';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

const randomInt = () => {
  return Math.ceil(Math.random() * 100);
};

const App = () => {
  const [text, setText] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);

  const handlePress = async () => {
    console.log('Scan in progress...');
    setText('Scan in progress...');
    setDisabled(true);

    await bleManager.startDeviceScan(
      [serviceUUID],
      null,
      async (error, device) => {
        if (error) {
          // TODO: handle Bluetooth adapter or Location off
          console.log(JSON.stringify(error));
          setText('Scan error');
          setDisabled(false);
          return;
        }

        await bleManager.stopDeviceScan();

        await bleManager.connectToDevice(device.id);
        console.log(device.name);

        await device.discoverAllServicesAndCharacteristics();

        let jsonToSend = {
          functionName: 'ADD',
          args: [randomInt(), randomInt()],
        };

        let buff = new Buffer(JSON.stringify(jsonToSend));

        await device.writeCharacteristicWithResponseForService(
          serviceUUID,
          characteristicUUID,
          buff.toString('base64'),
        );

        const characteristic = await device.readCharacteristicForService(
          serviceUUID,
          characteristicUUID,
        );

        let b = new Buffer(characteristic.value, 'base64');
        let res = JSON.parse(b.toString());
        console.log(res);

        await device.cancelConnection();

        console.log('Scan finished');
        setText('Scan finished');
        setDisabled(false);
      },
    );
  };

  return (
    <View style={styles.containerStyle}>
      <Button title="Click me!" onPress={handlePress} disabled={disabled} />
      <Text>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
