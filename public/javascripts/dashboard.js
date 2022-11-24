$(() => {
  if (!window.localStorage.getItem('token')) {
    window.location.replace('unauthorized.html');
  }

  $('#btnLogOut').click(logout);

  // profile summary
  const emailDisplay = $('.profile-summary-card-info-email');
  const lastAccessDisplay = $('.profile-summary-card-info-time');

  // device summary
  const deviceRows = $('.device-summary-card-table tbody');

  // buttons and inputs
  const addNewDeviceIdInputField = $('#new-device-id-input');
  const addNewDeviceNameInputField = $('#new-device-name-input');
  const addNewDeviceButton = $('#add-new-device-button');

  var response;

  (async () => {
    response = await axios.get('/api/auth', {
      headers: { 'x-auth': window.localStorage.getItem('token') },
    });

    if (!response.data.success) {
      window.location.replace('unauthorized.html');
    }

    const email = response.data.user.email;
    const lastAccess = response.data.user.lastAccess;
    const devicesAdded = response.data.user.devices_added;
    const devices = response.data.user.devices;

    devices.sort((a, b) => {
      return new Date(b.time_added) - new Date(a.time_added);
    });

    emailDisplay.text(email);
    lastAccessDisplay.text(lastAccess);

    for (const device of devices) {
      const $itemRow = $('<tr>');
      const $nameData = $('<td>', {
        text: device.device_name || `device_${devicesAdded}`,
      });
      const $idData = $('<td>', {
        text: device.device_id,
      });
      $itemRow.append([$nameData, $idData]);
      deviceRows.append($itemRow);
    }

    addNewDeviceButton.click(() => {
      const deviceID = addNewDeviceIdInputField.val();
      const deviceName = addNewDeviceNameInputField.val();
      addNewDevice(deviceName, deviceID, email);
    });
  })();
});

async function addNewDevice(name, id, email) {
  const response = await axios.post('/api/add_new_device', {
    email: email,
    deviceID: id,
    deviceName: name,
  });
  if (response.data.success) {
    window.alert(response.data.message);
    location.reload();
  }
}

function logout() {
  localStorage.removeItem('token');
  window.location.replace('index.html');
}
