import {SafeAreaView, StyleSheet, ToastAndroid, View} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {Button} from 'react-native-paper';
import Chart from './Chart';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export function DetailsScreen({route, navigation}) {
  const {deviceId, deviceName} = route.params;

  const chartRef = React.useRef();
  const recordingRef = React.useRef({xs: [], ys: []});
  const deviceRef = React.useRef(null);
  const subscriptionRef = React.useRef(null);

  const [recording, setRecording] = React.useState(false);

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

    recordingRef.current.xs.push(...xs);
    recordingRef.current.ys.push(...ys);

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

  const handleStartRecording = React.useCallback(() => {
    recordingRef.current = {xs: [], ys: []};
    setRecording(true);
    ToastAndroid.show('Recording started', ToastAndroid.SHORT);
  }, []);

  const handleStopRecording = React.useCallback(() => {
    setRecording(false);
    const xs = recordingRef.current.xs;
    const ys = recordingRef.current.ys;
    const rows = xs.map((x, i) => `${x},${ys[i]}`);
    const header = 'x,y';
    const csv = [header, ...rows].join('\n');
    console.log(csv);
    ToastAndroid.show('Recording saved', ToastAndroid.SHORT);
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Chart ref={chartRef} height={400} />
      <View style={styles.recordingView}>
        <View style={styles.cellView}>
          <Button
            mode="contained"
            icon="record"
            color="red"
            onPress={handleStartRecording}
            disabled={recording}>
            Record
          </Button>
        </View>
        <View style={styles.cellView}>
          <Button
            mode="contained"
            icon="stop"
            color="black"
            onPress={handleStopRecording}
            disabled={!recording}>
            Stop
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  recordingView: {
    flexDirection: 'row',
    padding: 8,
  },
  cellView: {
    flex: 1,
    padding: 8,
  },
});
