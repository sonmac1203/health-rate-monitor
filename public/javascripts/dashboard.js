import { getConvertedTime, getTimeInDatabaseFormat } from './utils.js';
import { logout } from './authFunctions.js';

$(() => {
  if (!localStorage.getItem('token')) {
    location.replace('unauthorized.html');
    return;
  }

  $('.sign-out-button').on('click', logout);

  const profileSummaryAndNavCard = {
    mobileContainer: $('#mobile-profile-summary-card'),
    normalContainer: $('#profile-summary-content-container'),
  };

  // README: Define DOM elements belong to devices management card
  const devicesManagementCard = {
    accessTokenInputField: $('#access-token-input'),
    newDeviceIdInputField: $('#new-device-id-input'),
    newDeviceNameInputField: $('#new-device-name-input'),
    addAccessTokenButton: $('#add-access-token-button'),
    addDeviceButton: $('#add-new-device-button'),
    removeDeviceButton: $('#remove-device-button'),
    deviceRows: $('.device-management-card-table tbody'),
  };

  // README: Define DOM elements belong to profile management card
  const profileDetailsCard = {
    usernameField: $('input#profile-details-card-username'),
    emailField: $('input#profile-details-card-email'),
  };

  // README: Define DOM elements belong to measurement settings card
  const measurementSettingsCard = {
    settingNameInput: $('#setting-name'),
    frequencyInput: $('#measurement-frequency'),
    startTimeInput: $('#measurement-start'),
    endTimeInput: $('#measurement-end'),
    deviceSelect: $('#measurement-chosen-device'),
    updateButton: $('#measurement-settings-card-update-button'),
  };

  const pillsSection = {
    frequencyDivSettingsPill: $('.setting-pill-frequency'),
    startTimeDivSettingPill: $('.setting-pill-start-time'),
    endTimeDivSettingPill: $('.setting-pill-end-time'),
    refreshChip: $('.refresh-chip'),
  };

  var response;

  (async () => {
    response = await axios.get('/api/auth', {
      headers: { 'x-auth': window.localStorage.getItem('token') },
    });

    if (!response.data.success) {
      window.location.replace('unauthorized.html');
    }

    // README: Deconstruct attributes from response
    const {
      name,
      email,
      access_token: accessToken,
      devices_added: devicesAdded,
      devices,
    } = response.data.user;

    // README: Sort devices by time added
    devices.sort((a, b) => {
      return new Date(b.time_added) - new Date(a.time_added);
    });

    // README: Construct an object to look up device's information by key
    let formattedDeviceList = {};
    for (const device of devices) {
      const { device_id, device_name, time_added, measurement_settings } =
        device;
      formattedDeviceList[device_id] = {
        device_name,
        time_added,
        measurement_settings,
      };
    }

    /*
     * README: Populate data for profile card
     */
    const profileName = $('<div>').append($('<b>', { text: name }));
    const profileEmail = $('<span>', { text: email, style: 'font-size: 12px' });
    const profileContent = $('<div>', { id: 'normal-content' }).append([
      profileName,
      profileEmail,
    ]);
    if (profileSummaryAndNavCard.mobileContainer.css('display') !== 'none') {
      $('<div>', { id: 'mobile-content' })
        .append([profileName, profileEmail])
        .insertAfter('#mobile-profile-summary-card img.profile-summary-avatar');
    }
    if (profileSummaryAndNavCard.normalContainer.css('display') !== 'none') {
      profileSummaryAndNavCard.normalContainer.append(profileContent);
    }

    /*
     * README: Populate data for devices management card
     * by iterating through the list of devices,
     * then construct a table row to add to the table.
     * An event handler for the add new device button is also added.
     */

    if (accessToken.length === 0) {
      devicesManagementCard.newDeviceIdInputField.attr('disabled', true);
      devicesManagementCard.newDeviceNameInputField.attr('disabled', true);
    } else {
      devicesManagementCard.newDeviceIdInputField.attr('disabled', false);
      devicesManagementCard.newDeviceNameInputField.attr('disabled', false);
      devicesManagementCard.accessTokenInputField.attr('disabled', true);
      devicesManagementCard.accessTokenInputField.val(accessToken);
      devicesManagementCard.addAccessTokenButton.attr('disabled', true);
    }

    devicesManagementCard.addAccessTokenButton.on('click', function () {
      const accessToken = devicesManagementCard.accessTokenInputField.val();
      (async () => {
        const { data } = await axios.post('/api/update_access_token', {
          email: email,
          accessToken: accessToken,
        });
        if (data.success) {
          location.reload();
          window.alert(data.message);
        }
      })();
    });

    const favoriteDeviceID =
      window.localStorage.getItem('favoriteDeviceID') || '';
    for (const device of devices) {
      const $itemRow = $('<tr>', {
        id: device.device_id,
        class: `device-management-card-row${
          favoriteDeviceID === device.device_id ? ' active-row' : ''
        }`,
      });
      const $nameData = $('<td>', {
        text: device.device_name || '---',
      });
      const $idData = $('<td>', {
        text: device.device_id,
      });
      const $iconData = $('<td>', { class: 'icon-data-cell' }).append(
        $('<i>', {
          class: 'fa-regular fa-square-check',
          style: 'font-size: 20px; color: var(--secondary-brand-color)',
        })
      );
      const rowData =
        favoriteDeviceID === device.device_id
          ? [$nameData, $idData, $iconData]
          : [$nameData, $idData];
      $itemRow.append(rowData);
      devicesManagementCard.deviceRows.append($itemRow);
    }
    devicesManagementCard.addDeviceButton.on('click', function () {
      // add new device
      const deviceID = devicesManagementCard.newDeviceIdInputField.val();
      const deviceName = devicesManagementCard.newDeviceNameInputField.val();
      addNewDevice(deviceName, deviceID, email, accessToken);
    });

    devicesManagementCard.removeDeviceButton.on('click', function () {
      const deviceID = devicesManagementCard.newDeviceIdInputField.val();
      removeDevice(deviceID, email);
    });

    // when a user clicks on a table row
    devicesManagementCard.deviceRows.on('click', 'tr', function () {
      $('.device-management-card-row').removeClass('active-row');
      $('.icon-data-cell').remove();
      const deviceID = $(this).attr('id');
      localStorage.setItem('favoriteDeviceID', deviceID);
      $(this).addClass('active-row');
      location.reload();
    });

    /*
     * README: Populate data for profile management card
     * by setting placeholder values for pre-defined input fields.
     */
    localStorage.setItem('name', name);
    profileDetailsCard.usernameField.attr('placeholder', name);
    profileDetailsCard.emailField.attr('value', email);

    /*
     * README: Populate data for measurement settings card.
     * For initial render, choose the first device on the
     * device list for displaying, if at least a device has
     * already been added.
     */

    // Define default values
    const defaultMinute = devices[0]?.measurement_settings.frequency || '--';
    const defaultStartTime = getConvertedTime(
      devices[0]?.measurement_settings.start_time
    );
    const defaultEndTime = getConvertedTime(
      devices[0]?.measurement_settings.end_time
    );
    // Assign the defaul values to input fields
    measurementSettingsCard.frequencyInput.attr('placeholder', defaultMinute);
    measurementSettingsCard.startTimeInput.val(defaultStartTime);
    measurementSettingsCard.endTimeInput.val(defaultEndTime);

    for (const device of devices) {
      const $option = $('<option>', {
        value: device.device_id,
        text: device.device_id,
        selected: device.device_id === localStorage.getItem('favoriteDeviceID'),
      });

      measurementSettingsCard.deviceSelect.append($option);
    }

    // Define an on change handler for device select
    measurementSettingsCard.deviceSelect.change(() => {
      const chosenDeviceId = measurementSettingsCard.deviceSelect.val();
      changeDisplayValuesOfMeasurementSettingsInput(
        measurementSettingsCard.frequencyInput,
        measurementSettingsCard.startTimeInput,
        measurementSettingsCard.endTimeInput,
        formattedDeviceList[chosenDeviceId].measurement_settings
      );
    });

    let frequencyHasNewValue = false;
    let startTimeHasNewValue = false;
    let endTimeHasNewValue = false;

    measurementSettingsCard.updateButton.attr('disabled', true);
    measurementSettingsCard.frequencyInput.change(() => {
      const chosenDeviceId = measurementSettingsCard.deviceSelect.val();
      const currentValue = measurementSettingsCard.frequencyInput.val();
      const originalValue =
        formattedDeviceList[chosenDeviceId].measurement_settings.frequency;
      frequencyHasNewValue = currentValue != originalValue;
      measurementSettingsCard.updateButton.attr(
        'disabled',
        !frequencyHasNewValue
      );
    });
    measurementSettingsCard.startTimeInput.change(() => {
      const chosenDeviceId = measurementSettingsCard.deviceSelect.val();
      const currentValue = measurementSettingsCard.startTimeInput.val();
      const originalValue = getConvertedTime(
        formattedDeviceList[chosenDeviceId].measurement_settings.start_time
      );
      startTimeHasNewValue = currentValue != originalValue;
      measurementSettingsCard.updateButton.attr(
        'disabled',
        !startTimeHasNewValue
      );
    });
    measurementSettingsCard.endTimeInput.change(() => {
      const chosenDeviceId = measurementSettingsCard.deviceSelect.val();
      const currentValue = measurementSettingsCard.endTimeInput.val();
      const originalValue = getConvertedTime(
        formattedDeviceList[chosenDeviceId].measurement_settings.end_time
      );
      endTimeHasNewValue = currentValue != originalValue;
      measurementSettingsCard.updateButton.attr(
        'disabled',
        !endTimeHasNewValue
      );
    });

    measurementSettingsCard.updateButton.click(async () => {
      window.alert('Please wait...');
      const chosenSettings = {
        email: email,
        deviceID: measurementSettingsCard.deviceSelect.val(),
        setting_name: measurementSettingsCard.settingNameInput.val(),
        frequency: {
          hasChanged: frequencyHasNewValue,
          value: measurementSettingsCard.frequencyInput.val(),
        },
        start_time: {
          hasChanged: startTimeHasNewValue,
          value: getTimeInDatabaseFormat(
            measurementSettingsCard.startTimeInput.val()
          ),
        },
        end_time: {
          hasChanged: endTimeHasNewValue,
          value: getTimeInDatabaseFormat(
            measurementSettingsCard.endTimeInput.val()
          ),
        },
        accessToken: accessToken,
      };

      const { data: updateResponseData } = await axios.post(
        '/api/update_measurement_settings',
        chosenSettings
      );

      if (updateResponseData.success) {
        window.alert(updateResponseData.message);
        location.reload();
      }
    });

    /*
     * README: Populate data for pill section.
     * For initial render, display unknown characters such as '-' or '--'
     * As a device has been chosen and stored to localStorage,
     * show the data of that device
     */

    const pillsSectionData = {
      frequency:
        formattedDeviceList[favoriteDeviceID]?.measurement_settings.frequency ||
        '-- --',
      startTime:
        getConvertedTime(
          formattedDeviceList[favoriteDeviceID]?.measurement_settings.start_time
        ) || '-- : -- --',
      endTime:
        getConvertedTime(
          formattedDeviceList[favoriteDeviceID]?.measurement_settings.end_time
        ) || '-- : -- --',
    };

    pillsSection.frequencyDivSettingsPill.append(
      $('<span>', { text: pillsSectionData.frequency + ' mins' })
    );
    pillsSection.startTimeDivSettingPill.append(
      $('<span>', { text: pillsSectionData.startTime })
    );
    pillsSection.endTimeDivSettingPill.append(
      $('<span>', { text: pillsSectionData.endTime })
    );
    pillsSection.refreshChip.on('click', function () {
      location.reload();
    });
  })();
});

async function addNewDevice(name, id, email, accessToken) {
  const { data } = await axios.post('/api/add_new_device', {
    email: email,
    deviceID: id,
    deviceName: name,
    accessToken: accessToken,
  });
  window.alert('Please wait ...');
  if (data.success) {
    window.alert(data.message);
    location.reload();
  }
}

async function removeDevice(id, email) {
  const response = await axios.post('/api/remove_device', {
    email: email,
    deviceID: id,
  });
  if (response.data.success) {
    window.alert(response.data.message);
    location.reload();
  }
}

const changeDisplayValuesOfMeasurementSettingsInput = (
  frequencyInput,
  startTimeInput,
  endTimeInput,
  settings
) => {
  const { frequency, start_time, end_time } = settings;
  frequencyInput.attr('placeholder', frequency);
  startTimeInput.attr('value', getConvertedTime(start_time));
  endTimeInput.attr('value', getConvertedTime(end_time));
};
