$(() => {
  if (window.localStorage.getItem('token')) {
    window.location.replace('authorized.html');
  }
  $('#btnLogIn').click(login);
});

const login = async () => {
  const userEntry = {
    email: $('#emailEntry').val(),
    password: $('#passwordEntry').val(),
  };

  try {
    const response = await axios.post('/api/login', {
      email: userEntry.email,
      password: userEntry.password,
    });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      window.location.replace('dashboard.html');
    } else {
      window.alert(response.data.message);
    }
  } catch (err) {
    window.alert(err.response.data.message);
  }
};
