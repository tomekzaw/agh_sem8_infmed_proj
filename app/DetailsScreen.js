import {Alert, Platform, SafeAreaView, StyleSheet, View} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {Button} from 'react-native-paper';
import Chart from './Chart';
import RNFS from 'react-native-fs';
import React from 'react';
import Share from 'react-native-share';

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
  const [recordingPath, setRecordingPath] = React.useState(null);

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
  }, []);

  const handleStopRecording = React.useCallback(async () => {
    const xs = recordingRef.current.xs;
    const ys = recordingRef.current.ys;
    const rows = xs.map((x, i) => `${x},${ys[i]}`);
    const header = 'x,y';
    const csv = [header, ...rows].join('\n');

    const now = new Date().toISOString();
    const date = now.substring(0, 10);
    const time = now.substring(11, 19).split(':').join('-');
    const filename = `iomt_${date}_${time}.csv`;
    const path = RNFS.DocumentDirectoryPath + '/' + filename;
    try {
      await RNFS.writeFile(path, csv, 'utf8');
    } catch (err) {
      console.log(err.message);
    }
    setRecordingPath(path);
    setRecording(false);
    Alert.alert('Success', `Recording has been saved as ${filename}`);
  }, []);

  const handleShare = React.useCallback(async () => {
    const prefix = Platform.OS === 'android' ? 'file://' : '';
    try {
      await Share.open({url: prefix + recordingPath});
    } catch (err) {
      console.log(err);
    }
  }, [recordingPath]);

  const handleConfirmRemove = React.useCallback(async () => {
    Alert.alert(
      'Confirm',
      'Do you really want to delete the recording?',
      [
        {text: 'Cancel', style: 'cancel', onPress: () => {}},
        {text: 'OK', onPress: removeRecording},
      ],
      {cancelable: true, onDismiss: () => {}},
    );
  }, [removeRecording]);

  const removeRecording = React.useCallback(async () => {
    try {
      await RNFS.unlink(recordingPath);
    } catch (err) {
      console.log(err.message);
    }

    Alert.alert('Success', 'Recording has been deleted');
    setRecordingPath(null);
  }, [recordingPath]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.graphView}>
        <Chart ref={chartRef} height={380} />
      </View>
      <View style={styles.buttonsView}>
        <View style={styles.buttonView}>
          <Button
            mode="contained"
            icon="record"
            color="dodgerblue"
            onPress={handleStartRecording}
            disabled={recording || recordingPath}>
            Record
          </Button>
        </View>
        <View style={styles.buttonView}>
          <Button
            mode="contained"
            icon="stop"
            color="black"
            onPress={handleStopRecording}
            disabled={!recording || recordingPath}>
            Stop
          </Button>
        </View>
      </View>
      <View style={styles.buttonsView}>
        <View style={styles.buttonView}>
          <Button
            mode="contained"
            icon="share"
            color="lightgreen"
            onPress={handleShare}
            disabled={!recordingPath}>
            Share
          </Button>
        </View>
        <View style={styles.buttonView}>
          <Button
            mode="contained"
            icon="delete"
            color="lightcoral"
            onPress={handleConfirmRemove}
            disabled={!recordingPath}>
            Remove
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
  graphView: {
    paddingVertical: 16,
  },
  buttonsView: {
    flexDirection: 'row',
    padding: 8,
  },
  buttonView: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
