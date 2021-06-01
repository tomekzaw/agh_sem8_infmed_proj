import {SafeAreaView, StyleSheet, Text} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import Chart from './Chart';
import {Dimensions} from 'react-native';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export function DetailsScreen({route, navigation}) {
  const {deviceId, deviceName} = route.params;

  const deviceRef = React.useState(null);
  const subscriptionRef = React.useState(null);
  const [data, setData] = React.useState([1, 2, 3]);

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

          console.log(`Notification from ${device.id}`);
          const response = JSON.parse(
            Buffer.from(characteristic.value, 'base64').toString(),
          );
          setData(data => [
            ...data.slice(Math.max(data.length - 20, 0)),
            response.value,
          ]);
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
      <Text>name: {deviceName}</Text>
      <Text>id: {deviceId}</Text>
      <Chart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={200}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});