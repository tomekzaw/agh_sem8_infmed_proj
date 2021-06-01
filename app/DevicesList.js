import {List} from 'react-native-paper';
import React from 'react';

export function DevicesList({devices, onPress = null}) {
  return (
    <List.Section>
      <List.Subheader>
        {devices.length
          ? `Found devices (${devices.length})`
          : 'No devices found'}
      </List.Subheader>
      {devices.map(device => (
        <List.Item
          key={device.id}
          title={device.name}
          description={device.id}
          left={() => <List.Icon icon="bluetooth" />}
          onPress={() => onPress(device)}
        />
      ))}
    </List.Section>
  );
}
