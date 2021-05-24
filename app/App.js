/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {Button, StyleSheet, Text, View} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

const randomInt = () => {
  return Math.ceil(Math.random() * 1000);
};

const App = () => {
  const [disabled, setDisabled] = React.useState(false);

  const asyncHandleConnect = async (error, device) => {
    if (error) {
      // TODO: handle Bluetooth adapter or Location off
      console.log(JSON.stringify(error));
      return;
    }

    try {
      await bleManager.stopDeviceScan();
      console.log('Stopped device scan');

      await bleManager.connectToDevice(device.id, {requestMTU: 300});
      console.log('Connected to device');

      await device.discoverAllServicesAndCharacteristics();
      console.log('Discovered services and characteristics');

      const [min, max] = [randomInt(), randomInt()].sort();
      const request = {min, max, length: 50};
      console.log(`Generated request: ${JSON.stringify(request)}`);

      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        Buffer.from(JSON.stringify(request)).toString('base64'),
      );
      console.log('Wrote request to characteristic');

      const characteristic = await device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID,
      );
      console.log('Read response from characteristic');

      const response = JSON.parse(
        Buffer.from(characteristic.value, 'base64').toString(),
      );
      console.log(`Parsed response: ${JSON.stringify(response)}`);
    } catch (e) {
      console.log('Error');
    } finally {
      await device.cancelConnection();
      console.log('Closed connection');
      setDisabled(false);
    }
  };

  const handlePress = async () => {
    setDisabled(true);
    await bleManager.startDeviceScan([serviceUUID], null, asyncHandleConnect);
    console.log('Started device scan');
  };

  return (
    <View style={styles.containerStyle}>
      <Button title="Click me!" onPress={handlePress} disabled={disabled} />
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
