$(() => {
  if (!window.localStorage.getItem('token')) {
    window.location.replace('unauthorized.html');
  }

  $('#btnLogOut').click(logout);

  // profile summary
  const emailDisplay = $('.profile-summary-card-info-email');
  const lastAccessDisplay = $('.profile-summary-card-info-time');

  // device summary
  const deviceList = $('.device-summary-card-device-list');

  // buttons and inputs
  const addNewDeviceInputField = $('#new-device-id-input');
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
    const devices = response.data.user.devices;

    devices.sort((a, b) => {
      return new Date(b.time_added) - new Date(a.time_added);
    });

    emailDisplay.text(email);
    lastAccessDisplay.text(lastAccess);

    for (const device of devices) {
      const $item = $('<div>', {
        class: 'device-summary-card-device-item',
        text: `ID: ${device.device_id}`,
      });
      deviceList.append($item);
    }

    addNewDeviceButton.click(() => {
      const deviceID = addNewDeviceInputField.val();
      addNewDevice(deviceID, email);
    });
  })();
});

async function addNewDevice(id, email) {
  const response = await axios.post('/api/add_new_device', {
    email: email,
    deviceID: id,
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
