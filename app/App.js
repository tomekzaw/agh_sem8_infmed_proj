/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {Button, StyleSheet, Text, View} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import React from 'react';

const manager = new BleManager();

const App = () => {
  const [text, setText] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);

  const handlePress = () => {
    setText('Scan in progress...');
    setDisabled(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        // TODO: handle Bluetooth adapter or Location off
        console.log(JSON.stringify(error));
        setText('Scan error');
        setDisabled(false);
        return;
      }

      console.log(device.rssi);
      manager.stopDeviceScan();

      setText('Scan finished');
      setDisabled(false);
    });
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
