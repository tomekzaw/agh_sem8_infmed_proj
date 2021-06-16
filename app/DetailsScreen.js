import {SafeAreaView, StyleSheet, Text} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import Chart from './Chart';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export function DetailsScreen({route, navigation}) {
  const {deviceId, deviceName} = route.params;

  const chartRef = React.useRef();
  const deviceRef = React.useRef(null);
  const subscriptionRef = React.useRef(null);

  const asyncMonitor = React.useCallback(async (error, characteristic) => {
    if (error) {
      console.log('Error while monitoring');
      return;
    }

    const response = JSON.parse(
      Buffer.from(characteristic.value, 'base64').toString(),
    );

    const xs = response.xs;
    const ys = response.ys;

    chartRef.current?.addPoints(xs, ys);
  }, []);

  const asyncConnect = React.useCallback(async () => {
    try {
      const device = await bleManager.connectToDevice(deviceId, {
        requestMTU: 512,
      });
      console.log(`Connected to ${device.id}`);

      deviceRef.current = device;

      device.onDisconnected(() => {
        console.log(`Disconnected ${device.id}`);
      });

      await device.discoverAllServicesAndCharacteristics();
      console.log(`Discovered ${device.id}`);

      const characteristic = await device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID,
      );
      console.log(`Read characteristic for ${device.id}`);

      subscriptionRef.current = characteristic.monitor(asyncMonitor);
      console.log(`Subscribed for ${device.id}`);
    } catch (e) {
      console.log(`Error for ${deviceId}`);
      deviceRef.current = null;
    }
  }, [deviceId, asyncMonitor]);

  const asyncDisconnect = React.useCallback(() => {
    console.log('Cancelling subscription');
    subscriptionRef.current?.remove();
    deviceRef.current?.cancelConnection();
  }, []);

  React.useEffect(() => {
    asyncConnect();
    return asyncDisconnect;
  }, [deviceId, asyncConnect, asyncDisconnect]);

  React.useEffect(() => {
    navigation.setOptions({title: deviceName});
  }, [deviceName, navigation]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Chart ref={chartRef} height={400} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
