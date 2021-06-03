import React, {useState} from 'react';
const {forwardRef, useRef, useImperativeHandle} = React;
import ChartView from 'react-native-highcharts-wrapper';

const Chart = forwardRef(({data, width = 200, height = 150}, ref) => {
  const [mySeries, setMySeries] = useState(null);

  const testSeries = useRef();

  const Highcharts = 'Highcharts';
  const conf = {
    chart: {
      type: 'line',
      animation: {
        duration: 300,
      },
      marginRight: 10,
      scrollablePlotArea: {
        minWidth: 2000,
      },
      events: {
        load: function () {
          console.log('JESTEM TU');
          console.log(this.series)
          // let counter = 0;
          // let now = new Date().getTime();
          // const series = this.series[0];
          setMySeries(this.series[0]);

          // setInterval(function () {
          //   for (let i = 0; i < 5; ++i) {
          //     let x = now + counter * 500;
          //     let y = Math.random();
          //
          //     let redraw = i === 4;
          //     series.addPoint([x, y], redraw, true);
          //     counter++;
          //   }
          // }, 400);
        },
      },
    },

    title: {
      text: 'Live random data',
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150,
    },
    yAxis: {
      title: {
        text: 'Value',
      },
      plotLines: [
        {
          value: 0,
          width: 1,
          color: '#808080',
        },
      ],
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
          let randomData = [],
            time = new Date().getTime(),
            i;

          for (i = -50; i <= 0; i += 1) {
            randomData.push({
              x: time + i * 1000,
              y: Math.random(),
            });
          }
          return randomData;
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

  useImperativeHandle(ref, () => ({
    addPoints(points) {
      // console.log('SIEMA');
      // console.log(points);
      // console.log(mySeries);
    },
  }));

  return (
    <ChartView
      style={{height: 300}}
      config={conf}
      options={options}
      originWhitelist={['file://']}
    />
  );
});

export default Chart;
