import {SafeAreaView, StyleSheet} from 'react-native';

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

  const asyncConnect = async () => {
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

      subscriptionRef.current = characteristic.monitor(
        async (error, characteristic) => {
          console.log(`Monitoring ${device.id}`);

          if (error) {
            console.log(`Error while monitoring ${device.id}`);
            return;
          }

          // console.log(`Notification from ${device.id}`);
          const response = JSON.parse(
            Buffer.from(characteristic.value, 'base64').toString(),
          );

          const x = new Date().getTime();
          const y = response.value;
          chartRef.current?.addPoint(x, y);
        },
      );
      console.log(`Subscribed for ${device.id}`);
    } catch (e) {
      console.log(`Error for ${deviceId}`);
      deviceRef.current = null;
    }
  };

  const asyncDisconnect = async () => {
    await subscriptionRef.current?.remove();
    await deviceRef.current?.cancelConnection();
  };

  React.useEffect(() => {
    asyncConnect();
    return asyncDisconnect;
  }, [deviceId]);

  React.useEffect(() => {
    navigation.setOptions({title: deviceName});
  }, [deviceName]);

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
