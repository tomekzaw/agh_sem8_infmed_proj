import {Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import React from 'react';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const Chart = ({data}) => {
  return (
    <LineChart
      data={{datasets: [{data}]}}
      width={screenWidth}
      height={220}
      chartConfig={chartConfig}
    />
  );
};

export default Chart;
