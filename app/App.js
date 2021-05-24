/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import Chart from './Chart';
import {Dimensions} from 'react-native';
import React from 'react';

const bleManager = new BleManager();
const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

const randomInt = () => {
  return Math.ceil(Math.random() * 1000);
};

const defaultPatient = {
  pesel: '98073405591',
  ekg: [0, 0, 0, 200, -200, 20, -20, 0, 0, 0, 0, 0, 0],
};

const App = () => {
  const [patient, setPatient] = React.useState(defaultPatient);
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

      setPatient(response);
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
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar
        animated={true}
        backgroundColor="#111"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={styles.patientView}>
          <Text style={styles.patientName}>Jan Kowalski</Text>
          <Text style={styles.patientPesel}>PESEL: {patient.pesel}</Text>
        </View>
        <View style={styles.chartView}>
          <Chart
            data={patient.ekg}
            width={Dimensions.get('window').width - 40}
            height={200}
          />
        </View>
        <View style={styles.optionsView}>
          <View style={styles.buttonView}>
            <Button
              title="Odśwież"
              onPress={handlePress}
              disabled={disabled}
              color="rgba(51, 193, 86, 0.6)"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
  patientView: {
    marginBottom: 40,
  },
  patientName: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  patientPesel: {
    color: 'darkgray',
    fontSize: 15,
  },
  chartView: {
    marginBottom: 20,
  },
  optionsView: {
    alignItems: 'center',
  },
  buttonView: {
    width: 100,
  },
});

export default App;
