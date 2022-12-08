import {
  getFormattedDate,
  getTodayInTimeInputFormat,
  getYesterdayAndLastWeek,
} from './utils.js';

$(() => {
  if (!localStorage.getItem('favoriteDeviceID')) {
    return;
  }

  const deviceID = localStorage.getItem('favoriteDeviceID');

  // (async () => {
  //   const { data } = await axios.get(
  //     `/api/particle/device_report_weekly/${deviceID}`
  //   );

  //   console.log(data);
  // })();
});

const viewModePillFlipper = $('.view-mode-change-flipper-container');
const viewModePillInfoContainer = $('.view-mode-time-info-container');
const { yesterday, lastWeekDay } = getYesterdayAndLastWeek();

const weeklyViewProps = {
  mode: 'weekly',
  icon: $('<i>', {
    class: 'fa-solid fa-calendar-week',
  }),
  label: $('<span>', {
    text: `${getFormattedDate(lastWeekDay)} - ${getFormattedDate(yesterday)}`,
  }),
};
const dailyViewProps = {
  mode: 'daily',
  icon: $('<i>', {
    class: 'fa-solid fa-calendar-days',
  }),
  label: $('<input>', {
    type: 'date',
    id: 'view-mode-time-date-picker',
    name: 'view-mode-time-date-picker',
    class: 'view-mode-time-date-picker',
    value: getTodayInTimeInputFormat(),
  }),
};

const currentViewMode = localStorage.getItem('visualizationViewMode');
const { icon, label } =
  !currentViewMode || currentViewMode === 'weekly'
    ? weeklyViewProps
    : dailyViewProps;

viewModePillFlipper.append(icon);
viewModePillInfoContainer.append(label);

viewModePillFlipper.on('click', function () {
  const viewMode = localStorage.getItem('visualizationViewMode');
  $(this).empty();
  viewModePillInfoContainer.empty();

  const { mode, icon, label } =
    !viewMode || viewMode === 'weekly' ? dailyViewProps : weeklyViewProps;

  viewModePillInfoContainer.append(label);
  $(this).append(icon);
  localStorage.setItem('visualizationViewMode', mode);
});

const datePicker = $('#view-mode-time-date-picker');

$('#view-mode-time-date-picker').on('change', function () {
  console.log('hi');
  const deviceID = localStorage.getItem('favoriteDeviceID');
  if (!deviceID) {
    console.log('return');
    return;
  }
  const date = $(this).val();

  // console.log(date);
  // try {
  //   const { data } = await axios.get(
  //     `/api/particle/device_report_daily/${deviceID}/${date}`
  //   );
  //   console.log(data);
  // } catch (err) {
  //   console.log(err.response);
  // }
});
