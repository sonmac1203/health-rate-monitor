$('#emailEntry').on('change', () => {
  const regExpEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  const val = $('#emailEntry').val();
  if (!val.match(regExpEmail)) {
    $('#emailAlert').text('Please enter a valid email');
  } else {
    $('#emailAlert').text('');
  }
});

$('#passwordConfirmedEntry').on('change', () => {
  const password = $('#passwordEntry').val();
  const passwordConfirmed = $('#passwordConfirmedEntry').val();
  if (password !== passwordConfirmed) {
    console.log({ password, passwordConfirmed });
    $('#passwordAlert').text('Password does not match!');
  } else {
    $('#passwordAlert').text('');
  }
});

$('#signUpButton').on('click', async () => {
  const userEntry = {
    email: $('#emailEntry').val(),
    password: $('#passwordEntry').val(),
  };

  const response = await axios.post('/api/signup', {
    email: userEntry.email,
    password: userEntry.password,
  });

  if (response.data.success) {
    setTimeout(() => {
      window.location = 'login.html';
    }, 1000);
  } else {
    window.alert(response.data.msg);
  }
});
