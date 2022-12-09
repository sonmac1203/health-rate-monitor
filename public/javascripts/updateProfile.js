const fieldsAndButton = {
  nameInpulField: $('#profile-details-card-username'),
  emailField: $('#profile-details-card-email'),
  currentPassword: $('#profile-details-card-current-password'),
  newPassword: $('#profile-details-card-new-password'),
  saveButton: $('#profile-details-card-save-button'),
};

const userName = fieldsAndButton.nameInpulField.val();
const email = fieldsAndButton.emailField.val();
const currentPassword = fieldsAndButton.currentPassword.val();
const newPassword = fieldsAndButton.newPassword.val();

fieldsAndButton.saveButton.on('click', function () {
  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const digit = /[0-9]/;

  if (newPassword === currentPassword) {
    window.alert('New password cannot be the same as current password');
  } else {
    const isStrong =
      lower.test(newPassword) &&
      upper.test(newPassword) &&
      digit.test(newPassword) &&
      newPassword.length < 20 &&
      newPassword.length > 10;
    if (!isStrong) {
      window.alert(
        'New password must be between 10 and 20 characters, must contain at least one lowercase character, one uppercase character, and one digit. '
      );
    } else {
      (async () => {
        try {
          const { data } = await axios.post('/api/update_profile', {
            name: userName,
            email: email,
            currentPassword: currentPassword,
            newPassword: newPassword,
          });
          if (data.success) {
            location.reload();
          } else {
            window.alert(data.message);
          }
        } catch (err) {
          console.log(err.response);
        }
      })();
    }
  }
});

fieldsAndButton.currentPassword.on('input', function () {
  fieldsAndButton.saveButton.attr('disabled', currentPassword.length === 0);
});
