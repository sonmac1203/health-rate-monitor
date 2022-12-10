const fieldsAndButton = {
  nameInpulField: $('#profile-details-card-username'),
  emailField: $('#profile-details-card-email'),
  currentPassword: $('#profile-details-card-current-password'),
  newPassword: $('#profile-details-card-new-password'),
  saveButton: $('#profile-details-card-save-button'),
};

const currentName = localStorage.getItem('name');

fieldsAndButton.saveButton.on('click', function () {
  const userName = fieldsAndButton.nameInpulField.val();
  const email = fieldsAndButton.emailField.val();
  const currentPassword = fieldsAndButton.currentPassword.val();
  const newPassword = fieldsAndButton.newPassword.val();

  if (userName.length + currentPassword.length + newPassword.length === 0) {
    window.alert('No input was provided.');
    return;
  }

  if (userName.length > 0 && userName === currentName) {
    window.alert('New username must not be same.');
    return;
  }
  if (currentPassword.length > 0 && newPassword === currentPassword) {
    window.alert('New password cannot be the same as current password');
    return;
  }

  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const digit = /[0-9]/;
  const isStrong =
    lower.test(newPassword) &&
    upper.test(newPassword) &&
    digit.test(newPassword) &&
    newPassword.length < 20 &&
    newPassword.length > 10;

  if (currentPassword.length > 0 && newPassword.length > 0 && !isStrong) {
    window.alert(
      'New password must be between 10 and 20 characters, must contain at least one lowercase character, one uppercase character, and one digit. '
    );
    return;
  }

  const updateObject = {
    email: email,
    name: {
      update: userName.length > 0,
      value: userName,
    },
    password: {
      update: currentPassword.length > 0,
      value: {
        currentPassword: currentPassword,
        newPassword: newPassword,
      },
    },
  };

  (async () => {
    try {
      const { data } = await axios.post('/api/update_profile', updateObject);
      if (data.success) {
        location.reload();
        window.alert(data.message);
      } else {
        window.alert(data.message);
      }
    } catch (err) {
      console.log(err.response);
      window.alert(err.response.data.message);
    }
  })();
});
