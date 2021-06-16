import ChartView from 'react-native-highcharts-wrapper';
import React from 'react';
import {View} from 'react-native';

const Chart = React.forwardRef(({height = 200, maxPoints = 550}, ref) => {
  const webviewRef = React.useRef();

  const Highcharts = 'Highcharts';
  const conf = {
    chart: {
      backgroundColor: 'rgb(242,242,242)',
      type: 'line',
      animation: {
        duration: 5,
      },
      marginRight: 10,
      scrollablePlotArea: {
        minWidth: 1000,
        scrollPositionX: 1,
      },
      events: {
        load: function () {
          const series = this.series[0];

          window.pointsList = [];

          window.addPoints = (newPoints, maxPoints) => {
            window.pointsList.push.apply(window.pointsList, newPoints);
            if (window.pointsList.length > maxPoints) {
              window.pointsList.splice(0, window.pointsList.length - maxPoints);
            }

            series.setData(window.pointsList, true, false, false);
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
      tickPixelInterval: 200,
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
      min: -1,
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

  const addPoints = (xs, ys) => {
    const newList = [];

    for (let i = 0; i < xs.length; ++i) {
      const x = xs[i];
      const y = ys[i];

      newList.push([x, y]);
    }

    const points = newList.map(([x, y]) => `[${x},${y}]`).join(',');

    webviewRef.current?.injectJavaScript(
      `addPoints([${points}], ${maxPoints}); void(0);`,
    );
  };

  React.useImperativeHandle(ref, () => ({addPoints}));

  return (
    <View>
      <ChartView
        style={{height}}
        config={conf}
        options={options}
        originWhitelist={['file://']}
        ref={webviewRef}
      />
    </View>
  );
});

export default Chart;
