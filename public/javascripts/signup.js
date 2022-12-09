$('#emailEntry').on('change', function () {
  const regExpEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const val = $(this).val();
  $('#signUpButton').attr('disabled', !val.match(regExpEmail));
});

$('#passwordConfirmedEntry').on('change', function () {
  const passwordConfirmed = $(this).val();
  $('#signUpButton').attr('disabled', passwordConfirmed.length === 0);
});

$('#passwordEntry').on('change', function () {
  const password = $(this).val();
  $('#signUpButton').attr('disabled', password.length === 0);
});

$('#signUpButton').on('click', async () => {
  const name = $('#nameEntry').val();
  const email = $('#emailEntry').val();
  const password = $('#passwordEntry').val();
  const passwordConfirmed = $('#passwordConfirmedEntry').val();

  if (password !== passwordConfirmed) {
    window.alert('Password confirmation does not match. Please try again.');
  } else {
    const lower = /[a-z]/;
    const upper = /[A-Z]/;
    const digit = /[0-9]/;
    const isStrong =
      lower.test(password) &&
      upper.test(password) &&
      digit.test(password) &&
      password.length < 20 &&
      password.length > 10;
    if (!isStrong) {
      window.alert(
        'New password must be between 10 and 20 characters, must contain at least one lowercase character, one uppercase character, and one digit. '
      );
    } else {
      try {
        const response = await axios.post('/api/signup', {
          name: name,
          email: email,
          password: password,
        });
        if (response.data.success) {
          setTimeout(() => {
            window.alert(response.data.message);
            window.location = 'login.html';
          }, 1000);
        } else {
          window.alert(response.data.msg);
        }
      } catch (err) {
        window.alert(err.response.data.message);
      }
    }
  }
});
