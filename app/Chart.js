import {LineChart} from 'react-native-chart-kit';
import React from 'react';

const chartConfig = {
  strokeWidth: 1.5,
  color: () => 'rgba(51, 193, 86)',
  fillShadowGradient: 'rgba(51, 193, 86)',
  fillShadowGradientOpacity: 0.5,
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
};

const Chart = ({data, width = 200, height = 150}) => {
  return (
    <LineChart
      data={{datasets: [{data}]}}
      width={width}
      height={height}
      withInnerLines={false}
      withOuterLines={false}
      chartConfig={chartConfig}
      withDots={false}
    />
  );
};

export default Chart;
