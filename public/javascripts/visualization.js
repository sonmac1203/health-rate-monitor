import { getTodayInTimeInputFormat } from './utils.js';

const requestDailyData = async (deviceID, date) => {
  const { data } = await axios.get(
    `/api/particle/device_report_daily/${deviceID}/${date}`
  );
  return data;
};

const drawWeeklyChart = (heartRateData, oxygenLevelData) => {
  const {
    min: minHeartRate,
    max: maxHeartRate,
    avg: avgHeartRate,
  } = heartRateData;
  const {
    min: minOxygenLevel,
    max: maxOxygenLevel,
    avg: avgOxygenLevel,
  } = oxygenLevelData;
  const xAxis = ['min', 'max', 'avg'];
  const heartRateTrace = {
    x: xAxis,
    y: [minHeartRate, maxHeartRate, avgHeartRate],
    name: 'Heart rate',
    type: 'bar',
    marker: {
      color: '#ECAB55',
    },
  };
  const oxygenLevelTrace = {
    x: xAxis,
    y: [minOxygenLevel, maxOxygenLevel, avgOxygenLevel],
    name: 'Oxygen Level',
    type: 'bar',
    marker: {
      color: '#CD5C5C',
    },
  };
  const chartData = [heartRateTrace, oxygenLevelTrace];
  const chartLayout = {
    barmode: 'group',
    showlegend: true,
    legend: { orientation: 'h' },
    title: {
      text: 'THIS IS A TITLE',
    },
  };
  const chartConfig = { responsive: true };
  Plotly.newPlot('my-weekly-chart', chartData, chartLayout, chartConfig);
};

const drawDailyChart = (reports) => {
  console.log(reports);
  const xAxis = reports.map((r) => r.published_at);
  const heartRateData = reports.map((r) => r.data.heart_rate);
  const oxygenLevelData = reports.map((r) => r.data.oxygen_level);

  const heartRateTrace = {
    x: xAxis,
    y: heartRateData,
    type: 'scatter',
    name: 'Heart rate',
    marker: {
      color: '#ECAB55',
    },
  };

  const oxygenLevelTrace = {
    x: xAxis,
    y: oxygenLevelData,
    type: 'scatter',
    name: 'Oxygen Level',
    marker: {
      color: '#CD5C5C',
    },
  };
  const chartData = [heartRateTrace, oxygenLevelTrace];
  const chartLayout = {
    showlegend: true,
    legend: { orientation: 'h' },
    title: {
      text: 'THIS IS A TITLE',
    },
  };
  const chartConfig = { responsive: true };

  Plotly.newPlot('my-daily-chart', chartData, chartLayout, chartConfig);
};

const datePicker = $('#view-mode-date-picker');
datePicker.val(
  localStorage.getItem('liveDate')
    ? localStorage.getItem('liveDate')
    : getTodayInTimeInputFormat()
);

datePicker.on('change', async function () {
  const liveDate = $(this).val();
  const deviceID = localStorage.getItem('favoriteDeviceID');
  localStorage.setItem('liveDate', liveDate);
  const data = await requestDailyData(deviceID, liveDate);
  $('#my-daily-chart').empty();
  if (data.success) {
    drawDailyChart(data.data);
  } else {
    $('#my-daily-chart').append(chartNotFoundMessage);
  }
});

const sadFaceEmoji = $('<i>', {
  class: 'fa-regular fa-face-frown',
});
const chartNotFoundText = $('<span>', {
  text: 'Please choose a different date!',
});
const chartNotFoundMessage = $('<div>', {
  style:
    'margin: 20px 0; display: flex; gap: 5px; align-items: center; justify-content: center',
}).append([sadFaceEmoji, chartNotFoundText]);

$(() => {
  if (!localStorage.getItem('favoriteDeviceID')) {
    return;
  }
  const deviceID = localStorage.getItem('favoriteDeviceID');
  (async () => {
    const { data } = await axios.get(
      `/api/particle/device_report_weekly/${deviceID}`
    );
    const heartRateData = {
      min: data.data[0].min_heart_rate,
      max: data.data[0].max_heart_rate,
      avg: data.data[0].avg_heart_rate,
    };

    const oxygenLevelData = {
      min: data.data[0].min_oxygen_level,
      max: data.data[0].max_oxygen_level,
      avg: data.data[0].avg_oxygen_level,
    };
    drawWeeklyChart(heartRateData, oxygenLevelData);
  })();

  const liveDate = datePicker.val();
  (async () => {
    const data = await requestDailyData(deviceID, liveDate);
    $('#my-daily-chart').empty();
    if (data.success) {
      drawDailyChart(data.data);
    } else {
      $('#my-daily-chart').append(chartNotFoundMessage);
    }
  })();
});
