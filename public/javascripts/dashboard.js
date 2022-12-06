$(() => {
  if (!window.localStorage.getItem('token')) {
    window.location.replace('unauthorized.html');
  }

  $('#btnLogOut').click(logout);

  // README: Define DOM elements belong to devices management card
  const devicesManagementCard = {
    newDeviceIdInputField: $('#new-device-id-input'),
    newDeviceNameInputField: $('#new-device-name-input'),
    addDeviceButton: $('#add-new-device-button'),
    deviceRows: $('.device-summary-card-table tbody'),
  };

  // README: Define DOM elements belong to profile management card
  const profileManagementCard = {
    usernameField: $('.account-summary-card-username-container input'),
    emailField: $('.account-summary-card-email-container input'),
  };

  // README: Define DOM elements belong to measurement settings card
  const measurementSettingsCard = {
    settingNameInput: $('#setting-name'),
    frequencyInput: $('#measurement-frequency'),
    startTimeInput: $('#measurement-start'),
    endTimeInput: $('#measurement-end'),
    deviceSelect: $('#measurement-chosen-device'),
    updateButton: $('#measurement-settings-card-update-button'),
    recentSettingsContainer: $('#measurement-setting-cards-container'),
  };

  const pillsSection = {
    frequencyDivSettingsPill: $('.setting-pill-frequency'),
    startTimeDivSettingPill: $('.setting-pill-start-time'),
    endTimeDivSettingPill: $('.setting-pill-end-time'),
    deviceInfoPill: $('.device-info-pill'),
    viewModePill: $('.view-mode-pill'),
    viewModePillFlipper: $('.view-mode-change-flipper-container'),
  };

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

    // README: Deconstruct attributes from response
    const {
      name,
      email,
      devices_added: devicesAdded,
      devices,
      recent_settings,
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
     * README: Populate data for devices management card
     * by iterating through the list of devices,
     * then construct a table row to add to the table.
     * An event handler for the add new device button is also added.
     */
    const favoriteDeviceID =
      window.localStorage.getItem('favoriteDeviceID') || '';
    for (const device of devices) {
      const $itemRow = $('<tr>', {
        id: device.device_id,
        class: `device-summary-card-row${
          favoriteDeviceID === device.device_id ? ' active-row' : ''
        }`,
      });
      const $nameData = $('<td>', {
        text: device.device_name || `device_${devicesAdded}`,
      });
      const $idData = $('<td>', {
        text: device.device_id,
      });
      const $iconData = $('<td>', { class: 'icon-data-cell' }).append(
        $('<i>', {
          class: 'fa-regular fa-square-check',
          style: 'font-size: 15px',
        })
      );
      const rowData =
        favoriteDeviceID === device.device_id
          ? [$nameData, $idData, $iconData]
          : [$nameData, $idData];
      $itemRow.append(rowData);
      devicesManagementCard.deviceRows.append($itemRow);
    }
    devicesManagementCard.addDeviceButton.click(() => {
      const deviceID = addNewDeviceIdInputField.val();
      const deviceName = addNewDeviceNameInputField.val();
      addNewDevice(deviceName, deviceID, email);
    });

    // when a user clicks on a table row
    devicesManagementCard.deviceRows.on('click', 'tr', function () {
      $('.device-summary-card-row').removeClass('active-row');
      $('.icon-data-cell').remove();
      const $td = $('<td>', { class: 'icon-data-cell' }).append(
        $('<i>', {
          class: 'fa-regular fa-square-check',
          style: 'font-size: 15px',
        })
      );
      const deviceID = $(this).attr('id');
      localStorage.setItem('favoriteDeviceID', deviceID);
      $(this).addClass('active-row');
      $(this).append($td);
      location.reload();
    });

    /*
     * README: Populate data for profile management card
     * by setting placeholder values for pre-defined input fields.
     */
    profileManagementCard.usernameField.attr('placeholder', name || 'Son Mac');
    profileManagementCard.emailField.attr('placeholder', email);

    /*
     * README: Populate data for measurement settings card.
     * For initial render, choose the first device on the
     * device list for displaying, if at least a device has
     * already been added.
     */

    // Recent settings box
    for (const {
      setting_name,
      frequency,
      start_time,
      end_time,
    } of recent_settings) {
      const $card = $('<div>', { class: 'recent-settings-card' });

      const $titleAndButtonDiv = $('<div>', {
        class: 'recent-settings-card-title-and-button',
      });
      const $nameOfSettings = $('<div>').append(
        $('<b>', { text: setting_name })
      );
      const $useButton = $('<div>', {
        class: 'recent-settings-card-use-button',
        text: 'Use',
      });

      $titleAndButtonDiv.append([$nameOfSettings, $useButton]);

      const $settingDiv = $('<div>', {
        class: 'recent-settings-card-setting',
      });
      const $frequencyDiv = $('<div>', {
        class: 'recent-settings-card-pill',
      }).append([
        $('<i>', { class: 'fa-solid fa-wave-square' }),
        $('<span>', { text: `${frequency} minutes` }),
      ]);

      const $startTimeDiv = $('<div>', {
        class: 'recent-settings-card-pill',
      }).append([
        $('<i>', { class: 'fa-solid fa-hourglass-start' }),
        $('<span>', { text: getConvertedTime(start_time) }),
      ]);
      const $endTimeDiv = $('<div>', {
        class: 'recent-settings-card-pill',
      }).append([
        $('<i>', { class: 'fa-solid fa-wave-square' }),
        $('<span>', { text: getConvertedTime(end_time) }),
      ]);
      $settingDiv.append([$frequencyDiv, $startTimeDiv, $endTimeDiv]);
      $card.append([$titleAndButtonDiv, $settingDiv]);
      measurementSettingsCard.recentSettingsContainer.append($card);
    }

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
    measurementSettingsCard.startTimeInput.attr('value', defaultStartTime);
    measurementSettingsCard.endTimeInput.attr('value', defaultEndTime);
    measurementSettingsCard.deviceSelect.attr(
      'value',
      devices[0]?.device_id || 'No device was added'
    );

    for (const device of devices) {
      const $option = $('<option>', {
        value: device.device_id,
        text: device.device_id,
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
      deviceID: favoriteDeviceID || '--',
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
      weekViewText: `${getFormattedDate(
        getLastWeeksDate()
      )} - ${getFormattedDate(new Date())}`,
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
    pillsSection.deviceInfoPill.append(
      $('<span>', { text: pillsSectionData.deviceID })
    );

    const weekViewIcon = $('<i>', {
      class: 'fa-solid fa-calendar-week',
    });
    const dateViewIcon = $('<i>', {
      class: 'fa-solid fa-calendar-days',
    });

    const currentViewMode = localStorage.getItem('visualizationViewMode');
    const viewIcon =
      !currentViewMode || currentViewMode === 'weekly'
        ? weekViewIcon
        : dateViewIcon;
    pillsSection.viewModePillFlipper.append(viewIcon);

    pillsSection.viewModePillFlipper.on('click', function () {
      const viewMode = localStorage.getItem('visualizationViewMode');
      $(this).empty();
      $(this).append(
        !viewMode || viewMode === 'weekly' ? dateViewIcon : weekViewIcon
      );
      localStorage.setItem(
        'visualizationViewMode',
        !viewMode || viewMode === 'weekly' ? 'daily' : 'weekly'
      );
    });
  })();
});

const deviceSummaryProps = {
  pill: $('#device-summary-card-navigation-pill'),
  card: $('#device-summary-card'),
};

const accountSummaryProps = {
  pill: $('#account-summary-card-navigation-pill'),
  card: $('#account-summary-card'),
};

const measurementSettingProps = {
  pill: $('#measurement-settings-card-navigation-pill'),
  card: $('#measurement-settings-card'),
};

deviceSummaryProps.pill.click(() => {
  handleOnClickPill(deviceSummaryProps, [
    accountSummaryProps,
    measurementSettingProps,
  ]);
});

accountSummaryProps.pill.click(() => {
  handleOnClickPill(accountSummaryProps, [
    deviceSummaryProps,
    measurementSettingProps,
  ]);
});

measurementSettingProps.pill.click(() => {
  handleOnClickPill(measurementSettingProps, [
    deviceSummaryProps,
    accountSummaryProps,
  ]);
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

const handleOnClickPill = (clickedProps, otherProps) => {
  const { pill: chosenPill, card: chosenCard } = clickedProps;
  const pillClassNames = chosenPill.attr('class').split(' ');
  const activeClass = 'navigation-tab-active';

  if (pillClassNames.includes(activeClass)) {
    return;
  }
  for (const { pill, card } of otherProps) {
    const pillClasses = pill.attr('class').split(' ');
    const cardClasses = card.attr('class').split(' ');
    if (pillClasses.includes(activeClass)) {
      pill.removeClass(activeClass);
    }
    if (!cardClasses.includes('hidden')) {
      card.addClass('hidden');
    }
  }
  chosenCard.removeClass('hidden');
  chosenPill.addClass(activeClass);
};

const getConvertedTime = (time) => {
  if (!time) {
    return '';
  }
  return new Date(time * 1000).toISOString().substring(11, 16);
};

const getTimeInDatabaseFormat = (time) => {
  const [hour, minute] = time.split(':').map((i) => parseInt(i));
  return hour * 3600 + minute * 60;
};

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

function getLastWeeksDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
}

function getFormattedDate(date) {
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}
