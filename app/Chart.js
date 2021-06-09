import {StyleSheet, View} from 'react-native';

import {Button} from 'react-native-paper';
import ChartView from 'react-native-highcharts-wrapper';
import React from 'react';

export default function Chart({height = 200}) {
  const webviewRef = React.useRef();

  const Highcharts = 'Highcharts';
  const conf = {
    chart: {
      backgroundColor: 'rgb(242,242,242)',
      type: 'line',
      animation: {
        duration: 100,
      },
      marginRight: 10,
      scrollablePlotArea: {
        minWidth: 2000,
        scrollPositionX: 1,
      },
      events: {
        load: function () {
          const series = this.series[0];

          window.addPoint = y => {
            const x = new Date().getTime();
            series.addPoint([x, y], true, false);
          };
        },
      },
    },

    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 100,
    },
    yAxis: {
      title: {
        text: '',
      },
      plotLines: [
        {
          value: 0,
          width: 1,
          color: '#808080',
        },
      ],
      min: 0,
      max: 1,
    },
    tooltip: {
      formatter: function () {
        return (
          '<b>' +
          this.series.name +
          '</b><br/>' +
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +
          '<br/>' +
          Highcharts.numberFormat(this.y, 2)
        );
      },
    },
    legend: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        events: {
          legendItemClick: function () {
            return false;
          },
        },
      },
    },
    series: [
      {
        type: 'line',
        marker: {
          enabled: false,
        },
        name: 'Random data',
        data: (function () {
          // generate an array of random data
          // let randomData = [],
          //   time = new Date().getTime(),
          //   i;

          // for (i = -50; i <= 0; i += 1) {
          //   randomData.push({
          //     x: time + i * 1000,
          //     y: Math.random(),
          //   });
          // }
          // return randomData;
          return [
            // {
            //   x: new Date().getTime(),
            //   y: 0,
            // },
          ];
        })(),
      },
    ],
  };

  const options = {
    global: {
      useUTC: false,
    },
    lang: {
      decimalPoint: ',',
      thousandsSep: '.',
    },
  };

  const handlePress = () => {
    webviewRef.current?.injectJavaScript('addPoint(Math.random());');
  };

  return (
    <View>
      <ChartView
        style={{height}}
        config={conf}
        options={options}
        originWhitelist={['file://']}
        ref={webviewRef}
      />
      <Button onPress={handlePress}>Add point</Button>
    </View>
  );
}
