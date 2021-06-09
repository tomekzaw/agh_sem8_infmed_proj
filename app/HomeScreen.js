import {Alert, SafeAreaView} from 'react-native';
import {List, Switch} from 'react-native-paper';

import {BleManager} from 'react-native-ble-plx';
import {DeviceManager} from './DeviceManager';
import {DevicesList} from './DevicesList';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export function HomeScreen({navigation}) {
  const [isScanning, setScanning] = React.useState(false);
  const [devices, setDevices] = React.useState([]);
  const devicesRef = React.useRef({});

  const updateUI = () => {
    setDevices(
      Object.values(devicesRef.current).map(device => ({
        id: device.id,
        name: device.name,
      })),
    );
  };

  const addDevice = device => {
    devicesRef.current[device.id] = {
      id: device.id,
      name: device.name,
    };
    updateUI();
  };

  const hasDevice = device => {
    return device.id in devicesRef.current;
  };

  const deleteDevice = device => {
    delete devicesRef.current[device.id];
    updateUI();
  };

  const clearDevices = () => {
    devicesRef.current = {};
    updateUI();
  };

  const asyncHandleConnect = async (error, device) => {
    if (error) {
      console.log(JSON.stringify(error));
      Alert.alert('Error', error.message);
      setScanning(false);
      return;
    }

    if (hasDevice(device)) {
      // device already connected (prevent duplication)
      // console.log(`Duplicate of ${device.id}`);
      return;
    }

    addDevice(device);
    console.log(`Detected ${device.id} (${device.name})`);
  };

  const asyncStartScan = async () => {
    await bleManager.startDeviceScan(
      [serviceUUID],
      {allowDuplicates: true},
      asyncHandleConnect,
    );
  };

  const asyncStopScan = async () => {
    try {
      await bleManager.stopDeviceScan();
      clearDevices();
    } catch (e) {}
  };

  React.useEffect(() => {
    if (isScanning) {
      asyncStartScan();
      return asyncStopScan;
    } else {
      asyncStopScan();
    }
  }, [isScanning]);

  const onToggleSwitch = () => setScanning(!isScanning);

  const handlePress = device => {
    navigation.navigate('Details', {
      deviceId: device.id,
      deviceName: device.name,
    });
  };

  return (
    <SafeAreaView>
      <List.Section>
        <List.Item
          title="Scan"
          left={() => (
            <Switch value={isScanning} onValueChange={onToggleSwitch} />
          )}
        />
      </List.Section>
      {isScanning && <DevicesList devices={devices} onPress={handlePress} />}
    </SafeAreaView>
  );
}
