export const getConvertedTime = (time) => {
  return time ? new Date(time * 1000).toISOString().substring(11, 16) : '';
};

export const getTimeInDatabaseFormat = (time) => {
  const [hour, minute] = time.split(':').map((i) => parseInt(i));
  return hour * 3600 + minute * 60;
};

export const getFormattedDate = (date) => {
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

export const getTodayInTimeInputFormat = () => {
  var date = new Date();
  date.setDate(date.getDate() - 1); // convert to the day before
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  var today = year + '-' + month + '-' + day;
  return today;
};

export const getYesterdayAndLastWeek = () => {
  const date = new Date();
  const yesterday = new Date(date.setDate(date.getDate() - 1));
  const lastWeekDay = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate() - 6
  );
  return {
    yesterday,
    lastWeekDay,
  };
};
